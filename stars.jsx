// Stars + selected-paper store
// Both backed by localStorage; selection broadcasts to all listeners so any
// matrix row click updates the detail screen instantly.

// ============ STARS ============
const STARS_KEY = "folio_starred_v1";

let __starsCache = null;
const __starsListeners = new Set();

function loadStars() {
  if (__starsCache !== null) return __starsCache;
  try {
    const raw = localStorage.getItem(STARS_KEY);
    __starsCache = raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    __starsCache = new Set();
  }
  return __starsCache;
}

function saveStars() {
  try {
    localStorage.setItem(STARS_KEY, JSON.stringify([...__starsCache]));
  } catch (e) {
    console.warn("Could not save stars:", e);
  }
}

function toggleStar(paperId) {
  loadStars();
  if (__starsCache.has(paperId)) __starsCache.delete(paperId);
  else __starsCache.add(paperId);
  saveStars();
  __starsListeners.forEach(fn => fn());
}

function isStarred(paperId) {
  return loadStars().has(paperId);
}

function useStarred(paperId) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    __starsListeners.add(fn);
    return () => __starsListeners.delete(fn);
  }, []);
  return isStarred(paperId);
}

// Hook to subscribe to ALL starred papers (for counts)
function useStarredSet() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    __starsListeners.add(fn);
    return () => __starsListeners.delete(fn);
  }, []);
  return loadStars();
}

// Clickable star glyph for the matrix row
const StarToggle = ({ paperId, size = 14 }) => {
  const starred = useStarred(paperId);
  const onClick = (e) => {
    e.stopPropagation();
    toggleStar(paperId);
  };
  return (
    <span onClick={onClick}
      title={starred ? "Starred · click to unstar" : "Star this paper"}
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        width: size + 4, height: size + 4,
        fontSize: size, lineHeight: 1,
        color: starred ? TOKENS.accent : TOKENS.inkFaint,
        opacity: starred ? 1 : 0.5,
        transition: "opacity 0.12s, color 0.12s, transform 0.12s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = 1;
        e.currentTarget.style.transform = "scale(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = starred ? 1 : 0.5;
        e.currentTarget.style.transform = "scale(1)";
      }}>
      {starred ? "★" : "☆"}
    </span>
  );
};

// ============ SELECTED PAPER ============
// Used by detail screen — clicking a matrix row sets this.
const SEL_KEY = "folio_selected_paper_v1";

let __selectedId = null;
const __selectedListeners = new Set();

function loadSelected() {
  if (__selectedId !== null) return __selectedId;
  try {
    __selectedId = localStorage.getItem(SEL_KEY) || "p004";
  } catch (e) {
    __selectedId = "p004";
  }
  return __selectedId;
}

function setSelected(paperId) {
  __selectedId = paperId;
  try { localStorage.setItem(SEL_KEY, paperId); } catch (e) {}
  __selectedListeners.forEach(fn => fn());
}

function getSelected() {
  return loadSelected();
}

function useSelected() {
  const [id, setId] = React.useState(loadSelected());
  React.useEffect(() => {
    const fn = () => setId(__selectedId);
    __selectedListeners.add(fn);
    return () => __selectedListeners.delete(fn);
  }, []);
  return id;
}

window.toggleStar = toggleStar;
window.isStarred = isStarred;
window.useStarred = useStarred;
window.useStarredSet = useStarredSet;
window.StarToggle = StarToggle;
window.setSelected = setSelected;
window.getSelected = getSelected;
window.useSelected = useSelected;
window.__starsListeners = __starsListeners;
window.__selectedListeners = __selectedListeners;
