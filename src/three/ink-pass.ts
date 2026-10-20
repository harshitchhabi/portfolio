// The ink pass: turns the floor's data buffers into a riso-printed drawing.
//   1. Sobel edges on normals + depth → white ink lines, weight varies, sampling wobbles per boil frame
//   2. cross-hatching from how dark a surface is: up to three layers at different angles
//   3. pink and green halftone fills, the pink layer slipped by uMisregister
//   4. paper grain on top
// Daemon sprites (alpha 0.5 in the colour buffer) pass straight through.

export const InkShader = {
  name: 'InkShader',
  uniforms: {
    tDiffuse: { value: null },
    tNormal: { value: null },
    tDepth: { value: null },
    uRes: { value: [1, 1] },
    uBoil: { value: 0 },
    uTime: { value: 0 },
    uMisregister: { value: 8 },
    uHatch: { value: 1 },
    uNear: { value: 0.1 },
    uFar: { value: 80 },
    uDpr: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #include <packing>
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2 uRes;
    uniform float uBoil;
    uniform float uTime;
    uniform float uMisregister;
    uniform float uHatch;
    uniform float uNear;
    uniform float uFar;
    uniform float uDpr;
    varying vec2 vUv;

    const vec3 PAPER = vec3(0.055, 0.055, 0.063);
    const vec3 INK = vec3(0.949, 0.933, 0.894);
    const vec3 PINK = vec3(1.0, 0.282, 0.69);
    const vec3 GREEN = vec3(0.0, 0.663, 0.361);

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float depthAt(vec2 uv) {
      float z = texture2D(tDepth, uv).x;
      return -perspectiveDepthToViewZ(z, uNear, uFar);
    }

    float edgeAt(vec2 uv, vec2 px) {
      vec3 n[9];
      float d[9];
      int k = 0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 o = vec2(float(x), float(y)) * px;
          n[k] = texture2D(tNormal, uv + o).rgb;
          d[k] = depthAt(uv + o);
          k++;
        }
      }
      vec3 gxN = (n[2] + 2.0 * n[5] + n[8]) - (n[0] + 2.0 * n[3] + n[6]);
      vec3 gyN = (n[6] + 2.0 * n[7] + n[8]) - (n[0] + 2.0 * n[1] + n[2]);
      float en = sqrt(dot(gxN, gxN) + dot(gyN, gyN));
      float gxD = (d[2] + 2.0 * d[5] + d[8]) - (d[0] + 2.0 * d[3] + d[6]);
      float gyD = (d[6] + 2.0 * d[7] + d[8]) - (d[0] + 2.0 * d[1] + d[2]);
      float ed = sqrt(gxD * gxD + gyD * gyD) / max(d[4], 0.5);
      return max(smoothstep(0.55, 1.1, en), smoothstep(0.18, 0.4, ed));
    }

    // one family of hand-drawn hatch lines
    float hatch(vec2 p, float ang, float spacing, float width) {
      vec2 dir = vec2(cos(ang), sin(ang));
      float wob = (noise(p * 0.05 + uBoil * 3.1) - 0.5) * 2.2;
      float t = dot(p, dir) + wob;
      float f = abs(fract(t / spacing) - 0.5) * spacing;
      float broken = step(0.18, noise(p * 0.11 + vec2(uBoil * 5.0, 0.0)));
      return (1.0 - smoothstep(width * 0.5, width * 0.5 + 0.9, f)) * broken;
    }

    // halftone dots: amount 0..1 sets the dot size
    float dots(vec2 p, float amount, float ang, float cell) {
      mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
      vec2 q = r * p / cell;
      vec2 c = fract(q) - 0.5;
      float rad = sqrt(clamp(amount, 0.0, 1.0)) * 0.62;
      return 1.0 - smoothstep(rad - 0.08, rad + 0.08, length(c));
    }

    void main() {
      vec2 px = 1.0 / uRes;
      vec2 frag = gl_FragCoord.xy / uDpr;
      vec2 wob = (vec2(noise(frag / 38.0 + uBoil * 13.1), noise(frag / 38.0 + 7.3 + uBoil * 9.7)) - 0.5) * 2.4 * px * uDpr;

      vec4 c = texture2D(tDiffuse, vUv);
      float grain = (hash(frag + fract(uBoil * 0.37) * 91.0) - 0.5) * 0.05;

      // a daemon: keep the drawing as it is
      if (c.a > 0.25 && c.a < 0.75) {
        gl_FragColor = vec4(c.rgb + grain, 1.0);
        return;
      }

      vec3 col = PAPER;
      if (c.a > 0.75) {
        float lum = c.r;
        // riso layers: green in register, pink slipped
        vec2 slip = vec2(uMisregister, -uMisregister * 0.6) * px * uDpr;
        vec4 slipped = texture2D(tDiffuse, vUv + slip);
        // only floor pixels carry riso data; sprite pixels (alpha 0.5) don't
        float pinkAmt = slipped.a > 0.75 ? slipped.g : 0.0;
        float greenAmt = c.b;
        float pinkSolid = step(0.97, pinkAmt);
        float greenSolid = step(0.97, greenAmt);
        float g = max(greenSolid, dots(frag, greenAmt, 0.26, 4.5));
        float p = max(pinkSolid, dots(frag + vec2(1.7, 0.9), pinkAmt, 1.2, 4.5));
        col = mix(col, GREEN, g * 0.9);
        col = mix(col, PINK, p * 0.85);

        // dark surfaces get hatched; lit ones stay paper
        float h = 0.0;
        if (lum < 0.4) h = max(h, hatch(frag, 0.785, 7.0, 1.1));
        if (lum < 0.22) h = max(h, hatch(frag, -0.785, 7.5, 1.0));
        if (lum < 0.1) h = max(h, hatch(frag, 0.08, 5.5, 0.9));
        col = mix(col, INK * 0.8, h * uHatch * 0.55 * (1.0 - max(pinkSolid, greenSolid)));
      }

      float e = edgeAt(vUv + wob, px * (0.9 + 0.5 * noise(frag / 60.0 + uBoil)));
      col = mix(col, INK, e * (0.75 + 0.25 * noise(frag / 9.0)));

      gl_FragColor = vec4(col + grain, 1.0);
    }
  `,
};
