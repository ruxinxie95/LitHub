// Per-paper external links (URLs to journal page, arXiv, PDF, etc).
// Persisted to localStorage. Click-to-open when set; click-to-add when missing.

const LINKS_KEY = "folio_links_v1";

let __linksCache = null;
const __linksListeners = new Set();

function loadLinks() {
  if (__linksCache !== null) return __linksCache;
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    __linksCache = raw ? JSON.parse(raw) : {};
  } catch (e) {
    __linksCache = {};
  }
  return __linksCache;
}

function saveLinks() {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(__linksCache));
  } catch (e) {
    console.warn("Could not save links:", e);
  }
}

function getLink(paperId) {
  return loadLinks()[paperId] || null;
}

function setLink(paperId, url) {
  loadLinks();
  const trimmed = (url || "").trim();
  if (trimmed) __linksCache[paperId] = trimmed;
  else delete __linksCache[paperId];
  saveLinks();
  __linksListeners.forEach(fn => fn());
}

function useLink(paperId) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    __linksListeners.add(fn);
    return () => __linksListeners.delete(fn);
  }, []);
  return getLink(paperId);
}

// Normalize URL — add https:// if user typed bare domain
function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-z]+:\/\//i.test(trimmed)) return trimmed;     // already has scheme
  if (/^file:/i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

// === LINK EDIT POPOVER ===
// A small inline overlay positioned near the icon — click outside to dismiss.
let __popoverHost = null;
let __popoverSetState = null;

const LinkPopoverHost = () => {
  const [state, setState] = React.useState(null);
  // state: { paperId, title, anchorRect, initial } | null
  React.useEffect(() => {
    __popoverSetState = setState;
    return () => { if (__popoverSetState === setState) __popoverSetState = null; };
  }, []);

  if (!state) return null;
  return <LinkPopover {...state} onClose={() => setState(null)} />;
};

function openLinkPopover(paperId, title, anchorEl) {
  if (!__popoverSetState) return;
  const rect = anchorEl ? anchorEl.getBoundingClientRect() : null;
  __popoverSetState({
    paperId, title,
    anchorRect: rect ? { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right } : null,
    initial: getLink(paperId) || "",
  });
}

const LinkPopover = ({ paperId, title, anchorRect, initial, onClose }) => {
  const [val, setVal] = React.useState(initial);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const save = () => {
    setLink(paperId, val ? normalizeUrl(val) : "");
    onClose();
  };
  const clear = () => {
    setLink(paperId, "");
    setVal("");
    onClose();
  };

  // Position: prefer below anchor; fall back to centered.
  const W = 380;
  let style = {
    position: "fixed", zIndex: 100,
    width: W,
    background: TOKENS.paperLight,
    border: `1px solid ${TOKENS.accent}`,
    boxShadow: "0 8px 24px rgba(20,30,50,0.18), 0 1px 3px rgba(20,30,50,0.10)",
    padding: "16px 18px",
    borderRadius: 3,
    fontFamily: FONTS.serif,
  };
  if (anchorRect) {
    let top = anchorRect.bottom + 8;
    let left = anchorRect.left + (anchorRect.right - anchorRect.left) / 2 - W / 2;
    // Clamp horizontally to viewport
    if (left < 12) left = 12;
    if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
    // If too low, flip above
    if (top + 180 > window.innerHeight - 12) top = anchorRect.top - 180 - 8;
    style.top = top;
    style.left = left;
  } else {
    style.top = "50%"; style.left = "50%";
    style.transform = "translate(-50%, -50%)";
  }

  return (
    <React.Fragment>
      {/* Click-out backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 99,
        background: "transparent",
      }} />
      <div style={style} onClick={(e) => e.stopPropagation()}>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
          color: TOKENS.inkFaint, marginBottom: 4,
        }}>Link to paper</div>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
          color: TOKENS.inkSoft, marginBottom: 10, lineHeight: 1.4,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</div>
        <input
          ref={inputRef}
          type="url"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") onClose();
          }}
          placeholder="https://doi.org/… or arxiv.org/abs/…"
          style={{
            width: "100%", padding: "7px 10px",
            background: "white",
            border: `1px solid ${TOKENS.rule}`, borderRadius: 2,
            fontFamily: FONTS.mono, fontSize: 12, color: TOKENS.ink,
            outline: "none", boxSizing: "border-box",
          }}
        />
        <div style={{
          fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
          color: TOKENS.inkFaint, marginTop: 6, lineHeight: 1.4,
        }}>
          Paste a URL — journal page, arXiv, DOI, or any link.
          Press <span style={{ fontFamily: FONTS.mono }}>↵</span> to save.
        </div>
        <div style={{
          display: "flex", gap: 6, marginTop: 12, alignItems: "center",
        }}>
          <button onClick={save} style={popoverBtn(TOKENS.accent, true)}>Save</button>
          <button onClick={onClose} style={popoverBtn(TOKENS.inkSoft)}>Cancel</button>
          {initial && (
            <React.Fragment>
              <div style={{ flex: 1 }} />
              <button onClick={clear} style={popoverBtn(TOKENS.inkFaint)}>Clear</button>
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

const popoverBtn = (color, filled) => ({
  fontFamily: FONTS.serif, fontSize: 12,
  color: filled ? TOKENS.paperLight : color,
  background: filled ? color : "transparent",
  border: `1px solid ${color}`, borderRadius: 2,
  padding: "5px 12px", cursor: "pointer",
});

// === ICON FOR MATRIX ROW ===
// Compact: shows ↗ when link exists (clicks open in new tab), ⚠ when missing (click → popover).
const RowLinkIcon = ({ paper }) => {
  const url = useLink(paper.id);
  const onClick = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      openLinkPopover(paper.id, paper.title, e.currentTarget);
    }
  };
  return (
    <span
      onClick={onClick}
      title={url ? `Open: ${url}` : "No link saved — click to add"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 20,
        fontSize: url ? 12 : 11,
        lineHeight: 1,
        color: url ? TOKENS.teal : TOKENS.ochre,
        cursor: "pointer",
        opacity: url ? 0.7 : 0.55,
        transition: "opacity 0.12s, transform 0.12s",
        userSelect: "none",
        fontFamily: FONTS.mono,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = 1;
        e.currentTarget.style.transform = "scale(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = url ? 0.7 : 0.55;
        e.currentTarget.style.transform = "scale(1)";
      }}>
      {url ? "↗" : "⚠"}
    </span>
  );
};

// === BUTTON FOR DETAIL HEADER ===
// Larger: matches ToolbarButton styling. Single click opens or prompts.
const OpenLinkButton = ({ paper }) => {
  const url = useLink(paper.id);
  const onClick = (e) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      openLinkPopover(paper.id, paper.title, e.currentTarget);
    }
  };
  return (
    <button onClick={onClick} style={{
      fontFamily: FONTS.serif, fontSize: 12,
      color: url ? TOKENS.ink : TOKENS.ochre,
      background: url ? "transparent" : "rgba(196,141,49,0.06)",
      border: `1px solid ${url ? TOKENS.rule : TOKENS.ochre}`,
      borderRadius: 2,
      padding: "4px 10px",
      cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 4,
      whiteSpace: "nowrap",
    }}
    title={url ? `Open: ${url}` : "No link saved — click to add"}>
      {url ? <React.Fragment>Open ↗</React.Fragment> : <React.Fragment>⚠ Add link</React.Fragment>}
    </button>
  );
};

window.getLink = getLink;
window.setLink = setLink;
window.useLink = useLink;
window.openLinkPopover = openLinkPopover;
window.LinkPopoverHost = LinkPopoverHost;
window.RowLinkIcon = RowLinkIcon;
window.OpenLinkButton = OpenLinkButton;
