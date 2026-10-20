// One material for the whole floor. It doesn't output a picture: it outputs
// data for the ink pass.
//   colour pass  → r: how lit the surface is, g: pink riso amount, b: green riso amount
//   normal pass  → view-space normal, so the ink pass can find edges
// Sprites (the daemons) write their own drawn colours with alpha 0.5, which
// tells the ink pass to leave them exactly as drawn.

import { DoubleSide, ShaderMaterial, type Texture } from 'three';

export const FILL = {
  none: 0,
  pink: 1,
  green: 2,
  ledPink: 3,
  ledGreen: 4,
  floor: 5,
  strobePink: 6,
  strobeGreen: 7,
} as const;

/** Uniforms every material shares, updated once per frame. */
export const shared = {
  uPass: { value: 0 },
  uTime: { value: 0 },
  uStrobe: { value: 0 },
};

const vertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vW;
  varying float vDepth;
  varying float vPhase;
  void main() {
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = modelMatrix * instanceMatrix;
    #endif
    vec4 w = m * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(viewMatrix) * mat3(m) * normal);
    vec4 mv = viewMatrix * w;
    vDepth = -mv.z;
    vPhase = fract(sin(dot(m[3].xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uPass;
  uniform float uFill;
  uniform float uTone;
  uniform float uTime;
  uniform float uStrobe;
  varying vec3 vN;
  varying vec3 vW;
  varying float vDepth;
  varying float vPhase;

  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;

    if (uPass > 0.5) {
      // Floor tiles: bend the normal along the seams so they ink as lines.
      if (abs(uFill - 5.0) < 0.5) {
        vec2 g = fract(vW.xz / 1.2);
        float seam = step(g.x, 0.025) + step(g.y, 0.025);
        if (seam > 0.0) n = normalize(n + vec3(0.9, 0.0, 0.9));
      }
      gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
      return;
    }

    float diff = max(dot(n, normalize(vec3(-0.25, 0.75, 0.6))), 0.0);
    float lum = (0.12 + 0.88 * diff) * uTone * exp(-vDepth * 0.03);
    float pink = 0.0;
    float green = 0.0;

    if (abs(uFill - 1.0) < 0.5) pink = 0.25 + 0.6 * lum;
    if (abs(uFill - 2.0) < 0.5) green = 0.25 + 0.6 * lum;
    if (uFill > 2.5 && uFill < 4.5) {
      // status LEDs: solid ink, blinking at their own pace
      float on = step(0.35, fract(uTime * (0.35 + vPhase * 0.9) + vPhase * 7.0));
      if (uFill < 3.5) pink = on; else green = on;
      lum = 1.0;
    }
    if (uFill > 5.5) {
      float s = uStrobe * (0.6 + 0.4 * step(0.5, fract(vPhase * 3.0 + uTime * 0.25)));
      if (uFill < 6.5) pink = s; else green = s;
    }
    gl_FragColor = vec4(lum, pink, green, 1.0);
  }
`;

export function inkMaterial(fill: number = FILL.none, tone = 1) {
  return new ShaderMaterial({
    uniforms: { ...shared, uFill: { value: fill }, uTone: { value: tone } },
    vertexShader: vertex,
    fragmentShader: fragment,
    side: DoubleSide,
  });
}

const spriteVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const spriteFragment = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 uGrid;   // cols, rows in the sheet
  uniform vec2 uCell;   // col (boil frame), row (pose)
  uniform float uPass;
  uniform vec3 uColor;  // used when there is no map (pupils)
  uniform float uHasMap;
  varying vec2 vUv;
  void main() {
    if (uPass > 0.5) discard;
    vec4 c = vec4(uColor, 1.0);
    if (uHasMap > 0.5) {
      vec2 uv = (vec2(uCell.x, uGrid.y - 1.0 - uCell.y) + vUv) / uGrid;
      c = texture2D(map, uv);
      if (c.a < 0.45) discard;
    }
    gl_FragColor = vec4(c.rgb, 0.5);
  }
`;

export function spriteMaterial(map: Texture | null, cols = 3, rows = 3) {
  return new ShaderMaterial({
    uniforms: {
      uPass: shared.uPass,
      map: { value: map },
      uGrid: { value: [cols, rows] },
      uCell: { value: [0, 0] },
      uColor: { value: [0.949, 0.933, 0.894] },
      uHasMap: { value: map ? 1 : 0 },
    },
    vertexShader: spriteVertex,
    fragmentShader: spriteFragment,
    side: DoubleSide,
  });
}
