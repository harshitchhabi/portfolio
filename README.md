# Harshit Chhabi — Developer Portfolio

A premium, minimalist, single-page developer portfolio for **Harshit Chhabi**, Computer Science (Information Security) student at VIT Vellore.

Designed with an editorial, typography-first aesthetic inspired by **lauren-waller.com**, **Apple**, and **Linear**. Built strictly using **plain HTML5, CSS3, and vanilla JavaScript** with zero external frameworks or libraries.

---

## 🎨 Design Philosophy & Aesthetic Guidelines

- **Typography-First**: Powered by Inter with fluid responsive sizing (`clamp()`) and strict typographic hierarchy.
- **Editorial Layout**: Generous whitespace, editorial numbering (`01 / SELECTED WORK`, `02 / ABOUT & SKILLS`, `03 / CONTACT`), and clear content hierarchy.
- **Restraint & Precision**: Strict minimal color palette. No glassmorphism, no neon glows, no gradients, no decorative filler.
- **100% Verified Accomplishments**: Every project, technology stack, experience, and leadership role is strictly verified against real GitHub repositories and resume/LinkedIn data.

---

## 🛠️ Design System & Color Tokens

### Light Theme
- **Background (`--bg-primary`)**: `#F8F8F5` (Warm editorial off-white)
- **Foreground (`--text-primary`)**: `#111111`
- **Accent (`--accent`)**: `#2563EB` (Used strictly for links, active nav states, and buttons)
- **Borders (`--border-subtle`)**: `#E2E2DC`

### Dark Theme
- **Background (`--bg-primary`)**: `#0D0D0D`
- **Foreground (`--text-primary`)**: `#F5F5F5`
- **Accent (`--accent`)**: `#60A5FA`
- **Borders (`--border-subtle`)**: `#262626`

---

## 📁 Repository Structure

```text
Portfolio/
├── index.html            # Semantic single-page HTML5 document
├── style.css             # CSS variable design system, layout, typography & theme tokens
├── script.js            # Light/Dark toggle, scroll-spy, drawer nav & IntersectionObserver
├── assets/
│   ├── icons/            # SVG vector icon assets (GitHub, LinkedIn, Mail, etc.)
│   └── images/           # SVG technical project visuals (Signify, File-Hash, GreenRoute)
└── README.md             # Technical documentation & project guide
```

---

## 🚀 Key Features

1. **Announcement Marquee**: Fixed top continuous CSS ticker highlighting internship availability and core domains.
2. **Sticky Navigation**: Backdrop blur header with scroll-spy link highlighting and accessible theme switcher.
3. **Theme Persistence**: Light and Dark mode toggle with preference saved to `localStorage` and system `prefers-color-scheme` fallback.
4. **Verified Projects Grid**:
   - **Signify**: Real-time ASL-to-English translator (`Next.js`, `FastAPI`, `PyTorch`, `MediaPipe`).
   - **Secure File Hashing & Dual Encryption**: Cryptographic app combining SHA-256 integrity, AES-256-CBC, and RSA-2048 (`Node.js`, `Express`, `MySQL`).
   - **GreenRoute (FlashCar)**: Sustainable mobility platform (`React 18`, `Vite`, `Firebase Auth`, `Google Maps API`).
5. **Categorized Skills Matrix**: Technical skills grouped by verified usage in code repositories across Languages, Cybersecurity, AI/ML, Backend/DB, and Tools.
6. **Accessibility & Performance**:
   - Full keyboard navigation with visible focus rings (`:focus-visible`).
   - Respects `prefers-reduced-motion` settings.
   - Zero render-blocking JavaScript dependencies.

---

## 💻 Local Preview

To view the portfolio locally:

1. Double-click `index.html` or open it directly in any modern browser.
2. Or serve via Python static server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.
