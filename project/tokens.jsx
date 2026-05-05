// Shared lab-notebook design tokens & atoms
// Scientific palette — cool, neutral, blue accent
const THEMES = {
  scientific: {
    paper: "#F2F4F7",       // cool off-white
    paperDeep: "#E6EAF0",
    paperLight: "#FAFBFD",
    ink: "#1A2230",
    inkSoft: "#42526B",
    inkFaint: "#7A8699",
    rule: "#C2CAD6",
    ruleFaint: "#DDE2EB",
    accent: "#1F5FB5",      // scientific blue
    accentSoft: "#4A86D6",
    ochre: "#5D7A99",       // muted slate-blue (was warning yellow)
    sage: "#3F8C7A",        // teal-green
    teal: "#1F5FB5",
    pencil: "#3B4658",
    highlight: "#BFD7F2",   // soft blue highlight (replaces yellow)
    highlightStrong: "#1F5FB5",
    shadow: "rgba(20, 30, 50, 0.10)",
  },
  notebook: {
    paper: "#F4EBDC",
    paperDeep: "#EADFCB",
    paperLight: "#FBF6EB",
    ink: "#2B2622",
    inkSoft: "#5C5346",
    inkFaint: "#8B8071",
    rule: "#C9BBA3",
    ruleFaint: "#DCD0BB",
    accent: "#A8472B",
    accentSoft: "#C66B47",
    ochre: "#B8923A",
    sage: "#6B7A4C",
    teal: "#2F6F75",
    pencil: "#4A4036",
    highlight: "#F5D77E",
    highlightStrong: "#A8472B",
    shadow: "rgba(60, 40, 20, 0.12)",
  },
};

// TOKENS is now mutable — Tweaks panel rewrites its keys live
const TOKENS = { ...THEMES.scientific };
const applyTheme = (name) => {
  const t = THEMES[name] || THEMES.scientific;
  Object.keys(t).forEach((k) => { TOKENS[k] = t[k]; });
};

// Scientific defaults: serif for body, sans for display, mono for data, hand only as accent
const FONT_PRESETS = {
  scientific: {
    serif: "'Source Serif Pro', 'Iowan Old Style', Georgia, serif",
    hand: "'Source Serif Pro', Georgia, serif",
    mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
    display: "'Inter', 'Helvetica Neue', system-ui, sans-serif",
  },
  notebook: {
    serif: "'Source Serif Pro', 'Iowan Old Style', Georgia, serif",
    hand: "'Caveat', 'Kalam', 'Patrick Hand', cursive",
    mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
    display: "'Source Serif Pro', Georgia, serif",
  },
};
const FONTS = { ...FONT_PRESETS.scientific };
const applyFonts = (name) => {
  const f = FONT_PRESETS[name] || FONT_PRESETS.scientific;
  Object.keys(f).forEach((k) => { FONTS[k] = f[k]; });
};

// Stimulus tag -> color mapping (scientific palette: blues, teals, slate)
const STIM_COLOR = {
  heat: "#C25450",        // controlled red, not orange
  water: "#1F5FB5",       // accent blue
  humidity: "#3F7E9E",    // teal-blue
  light: "#7A6FA8",       // muted violet (was yellow)
  magnetic: "#5A4D8E",    // deep violet
  pH: "#8E4C6E",          // berry
  mechanical: "#42526B",  // slate
  electric: "#1F5FB5",
};

// Stimulus icon glyphs (tiny inline SVG)
const StimIcon = ({ kind, size = 10 }) => {
  const c = STIM_COLOR[kind] || TOKENS.inkSoft;
  const props = {
    width: size, height: size, viewBox: "0 0 12 12",
    style: { display: "inline-block", verticalAlign: "-1px", marginRight: 3 },
    fill: "none", stroke: c, strokeWidth: 1.4, strokeLinecap: "round",
  };
  switch (kind) {
    case "heat": return <svg {...props}><path d="M6 1 Q 3 4, 6 7 Q 9 4, 6 1 M6 7 Q 4 9, 6 11 Q 8 9, 6 7" /></svg>;
    case "water": return <svg {...props}><path d="M6 1 Q 2 6, 6 11 Q 10 6, 6 1 Z" /></svg>;
    case "humidity": return <svg {...props}><path d="M3 2 Q 1 5, 3 7 Q 5 5, 3 2 M9 4 Q 7 7, 9 9 Q 11 7, 9 4" /></svg>;
    case "light": return <svg {...props}><circle cx="6" cy="6" r="2.5" /><line x1="6" y1="1" x2="6" y2="2.5" /><line x1="6" y1="9.5" x2="6" y2="11" /><line x1="1" y1="6" x2="2.5" y2="6" /><line x1="9.5" y1="6" x2="11" y2="6" /><line x1="2.5" y1="2.5" x2="3.5" y2="3.5" /><line x1="8.5" y1="8.5" x2="9.5" y2="9.5" /></svg>;
    case "magnetic": return <svg {...props}><path d="M2 3 L 2 7 Q 2 10, 6 10 Q 10 10, 10 7 L 10 3 M2 3 L 4 3 L 4 6 M10 3 L 8 3 L 8 6" /></svg>;
    case "pH": return <svg {...props}><text x="6" y="9" fontSize="8" fill={c} stroke="none" textAnchor="middle" fontFamily="serif">pH</text></svg>;
    case "mechanical": return <svg {...props}><path d="M2 6 L 10 6 M3 4 L 2 6 L 3 8 M9 4 L 10 6 L 9 8" /></svg>;
    case "electric": return <svg {...props}><path d="M7 1 L 3 7 L 6 7 L 5 11 L 9 5 L 6 5 Z" fill={c} /></svg>;
    default: return <svg {...props}><circle cx="6" cy="6" r="3" /></svg>;
  }
};

// Common bits
const Tag = ({ children, color = TOKENS.inkSoft, bg = "transparent", style }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 0.4,
    color, background: bg,
    border: `1px solid ${color}`, borderRadius: 2,
    padding: "1px 6px",
    textTransform: "uppercase",
    ...style,
  }}>{children}</span>
);

const StimTag = ({ kind }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    fontFamily: FONTS.mono, fontSize: 10,
    color: STIM_COLOR[kind] || TOKENS.inkSoft,
    border: `1px solid ${STIM_COLOR[kind] || TOKENS.inkSoft}`,
    borderRadius: 10,
    padding: "1px 7px 1px 5px",
    background: "rgba(255,255,255,0.4)",
    marginRight: 4,
  }}>
    <StimIcon kind={kind} />{kind}
  </span>
);

const Star = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: "inline-block", verticalAlign: "-2px" }}>
    <path d="M6 1 L 7.5 4.5 L 11 5 L 8.5 7.5 L 9 11 L 6 9.2 L 3 11 L 3.5 7.5 L 1 5 L 4.5 4.5 Z"
      fill={filled ? TOKENS.accent : "none"} stroke={TOKENS.accent} strokeWidth="0.8" strokeLinejoin="round" />
  </svg>
);

// Paper texture: subtle noise via inline SVG, sepia tints
const PaperTexture = ({ children, style, deep = false }) => (
  <div style={{
    background: deep ? TOKENS.paperDeep : TOKENS.paper,
    backgroundImage: `
      radial-gradient(ellipse at top left, rgba(255,250,240,0.5), transparent 60%),
      radial-gradient(ellipse at bottom right, rgba(120,90,50,0.06), transparent 60%),
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.05 0'/></filter><rect width='240' height='240' filter='url(%23n)' opacity='0.5'/></svg>")
    `,
    color: TOKENS.ink,
    ...style,
  }}>{children}</div>
);

// Hand-drawn divider
const RuleLine = ({ style, color = TOKENS.rule, dashed = false }) => (
  <div style={{
    height: 1,
    background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)` : color,
    width: "100%", ...style,
  }} />
);

// Punched-hole margin (left side of notebook page)
const PunchHoles = ({ count = 12, height }) => (
  <div style={{
    position: "absolute", left: 18, top: 0, bottom: 0,
    width: 14, display: "flex", flexDirection: "column",
    justifyContent: "space-around", alignItems: "center",
    pointerEvents: "none",
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        width: 10, height: 10, borderRadius: "50%",
        background: "rgba(60,40,20,0.16)",
        boxShadow: "inset 0 1px 1px rgba(0,0,0,0.25)",
      }} />
    ))}
  </div>
);

window.TOKENS = TOKENS;
window.FONTS = FONTS;
window.applyTheme = applyTheme;
window.applyFonts = applyFonts;
window.THEMES = THEMES;
window.STIM_COLOR = STIM_COLOR;
window.StimIcon = StimIcon;
window.StimTag = StimTag;
window.Tag = Tag;
window.Star = Star;
window.PaperTexture = PaperTexture;
window.RuleLine = RuleLine;
window.PunchHoles = PunchHoles;
