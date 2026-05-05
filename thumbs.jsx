// Tiny SVG thumbnails — abstract glyphs evoking each paper's morphology
// Lab-notebook aesthetic: ink lines, sepia accents
const ThumbStyles = {
  ink: "#2B2622",
  accent: "#A8472B",
  paper: "#F4EBDC",
  faded: "#7A6F60",
};

const Thumb = ({ kind, size = 64 }) => {
  const s = size;
  const stroke = ThumbStyles.ink;
  const accent = ThumbStyles.accent;
  const wrap = (children) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ display: "block" }}>
      <rect width="64" height="64" fill={ThumbStyles.paper} />
      {children}
    </svg>
  );

  switch (kind) {
    case "flower":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
          <path d="M32 12 C 22 18, 22 30, 32 32 C 42 30, 42 18, 32 12 Z" stroke={accent} />
          <path d="M32 32 C 18 30, 14 42, 22 50 C 30 50, 34 42, 32 32 Z" />
          <path d="M32 32 C 46 30, 50 42, 42 50 C 34 50, 30 42, 32 32 Z" />
          <circle cx="32" cy="32" r="2" fill={accent} stroke="none" />
        </g>
      );
    case "vertical":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M16 50 L 22 14 L 28 50" />
          <path d="M28 50 L 34 18 L 40 50" stroke={accent} />
          <path d="M40 50 L 46 14 L 52 50" />
          <line x1="10" y1="52" x2="54" y2="52" />
        </g>
      );
    case "review":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <rect x="14" y="12" width="36" height="44" />
          <line x1="20" y1="20" x2="44" y2="20" />
          <line x1="20" y1="26" x2="44" y2="26" />
          <line x1="20" y1="32" x2="38" y2="32" stroke={accent} />
          <line x1="20" y1="38" x2="44" y2="38" />
          <line x1="20" y1="44" x2="36" y2="44" />
        </g>
      );
    case "shell":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M10 44 Q 32 10, 54 44" />
          <path d="M14 46 Q 32 18, 50 46" stroke={accent} />
          <path d="M20 48 Q 32 28, 44 48" />
          <line x1="8" y1="50" x2="56" y2="50" />
        </g>
      );
    case "bistable":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M10 40 Q 22 20, 32 40 Q 42 60, 54 40" stroke={accent} />
          <circle cx="22" cy="32" r="2" fill={accent} stroke="none" />
          <circle cx="42" cy="48" r="2" fill={accent} stroke="none" />
          <line x1="10" y1="50" x2="54" y2="50" />
        </g>
      );
    case "miura":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const x = 8 + c * 12 + (r % 2) * 4;
              const y = 14 + r * 9;
              return (
                <polygon
                  key={`${r}-${c}`}
                  points={`${x},${y} ${x + 12},${y - 2} ${x + 12},${y + 7} ${x},${y + 9}`}
                  stroke={r % 2 === 0 ? stroke : accent}
                />
              );
            })
          )}
        </g>
      );
    case "magnetic":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M16 40 Q 32 12, 48 40" stroke={accent} strokeWidth="2" />
          <line x1="16" y1="40" x2="16" y2="50" stroke={accent} strokeWidth="2" />
          <line x1="48" y1="40" x2="48" y2="50" stroke={accent} strokeWidth="2" />
          <line x1="14" y1="50" x2="50" y2="50" />
          <path d="M22 28 L 26 26 M 38 26 L 42 28" />
          <text x="32" y="56" fontSize="6" fill={stroke} textAnchor="middle" fontFamily="serif">N S</text>
        </g>
      );
    case "lce":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <circle cx="20" cy="16" r="3" fill={accent} stroke="none" />
          <line x1="20" y1="20" x2="20" y2="48" strokeDasharray="2 2" />
          <path d="M16 50 Q 32 30, 48 50" stroke={accent} />
          <path d="M14 52 Q 32 34, 50 52" />
        </g>
      );
    case "lattice":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <g key={`${r}-${c}`} transform={`translate(${10 + c * 16},${12 + r * 16})`}>
                <path d="M0 0 L 12 0 L 12 12 L 0 12 Z" stroke={(r + c) % 2 ? accent : stroke} />
                <path d="M0 0 L 12 12 M 12 0 L 0 12" />
              </g>
            ))
          )}
        </g>
      );
    case "hydrogel":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <path d="M10 42 Q 32 18, 54 42 L 54 50 L 10 50 Z" fill={accent} fillOpacity="0.15" />
          <path d="M10 42 Q 32 18, 54 42" stroke={accent} />
          <line x1="10" y1="50" x2="54" y2="50" />
          <text x="32" y="14" fontSize="6" fill={stroke} textAnchor="middle" fontFamily="serif">pH</text>
        </g>
      );
    case "kresling":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[0, 1, 2, 3].map((i) => {
            const y = 14 + i * 9;
            const offset = i % 2 ? 4 : 0;
            return (
              <g key={i}>
                <path
                  d={`M${16 + offset} ${y} L ${48 - offset} ${y} L ${44 + offset} ${y + 9} L ${20 - offset} ${y + 9} Z`}
                  stroke={i === 1 ? accent : stroke}
                />
              </g>
            );
          })}
        </g>
      );
    case "miura2":
      return wrap(
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const x = 6 + c * 13 + (r % 2) * 3;
              const y = 16 + r * 11;
              return (
                <polygon
                  key={`${r}-${c}`}
                  points={`${x},${y} ${x + 13},${y - 3} ${x + 13},${y + 8} ${x},${y + 11}`}
                  stroke={c === 1 ? accent : stroke}
                />
              );
            })
          )}
        </g>
      );
    default:
      return wrap(<rect x="16" y="16" width="32" height="32" fill="none" stroke={stroke} />);
  }
};

window.Thumb = Thumb;
