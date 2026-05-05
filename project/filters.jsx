// Filtering logic for Folio
// Centralized predicates + a React state hook that the Hub UI consumes.

// === COLLECTIONS — predicates over a paper ===
const COLLECTIONS = {
  all:         { label: "All papers",         predicate: () => true },
  starred:     { label: "Starred",            predicate: (p) => (window.isStarred ? window.isStarred(p.id) : p.starred) },
  fourD:       { label: "4D printing",        predicate: (p) => p.is4D },
  unread:      { label: "Unread",             predicate: (p) => !(window.isStarred ? window.isStarred(p.id) : p.starred) },
  hygromorph:  { label: "Hygromorphs",        predicate: (p) => /hygro|wood|cellulose|humid/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial) },
  bistable:    { label: "Bistable structures", predicate: (p) => p.bistable },
  origami:     { label: "Origami / kirigami", predicate: (p) => p.miura || /miura|origami|kresling|kirigami|fold/i.test(p.title) },
  soft:        { label: "Soft robotics",      predicate: (p) => /soft robot|actuator|gripper/i.test(p.title + " " + (p.abstract || "")) },
  biomimicry:  { label: "Biomimicry",         predicate: (p) => /biomim|bio-inspired|bioinspired|plant|venus|flytrap|waterwheel|pine cone|pinecone/i.test(p.title + " " + (p.abstract || "")) },
};

// === GEOMETRY tags — tracked separately ===
const GEOMETRY_PREDICATES = {
  bistable:   (p) => p.bistable,
  origami:    (p) => p.miura || /miura|origami|kresling|kirigami|fold/i.test(p.title),
  bilayer:    (p) => /bilayer|bi-layer/i.test(p.title + " " + (p.abstract || "")),
  lattice:    (p) => /lattice|metamaterial|metasurface/i.test(p.title + " " + (p.abstract || "")),
  shell:      (p) => /shell|dome|curved|gauss/i.test(p.title + " " + (p.abstract || "")),
};

// === FABRICATION buckets ===
const FAB_PREDICATES = {
  fdm:        (p) => /fdm|fff|fused/i.test(p.fabrication + " " + p.title + " " + (p.abstract || "")),
  general:    (p) => /3D\/4D printing|3d print|4d print|additive|extrusion/i.test(p.fabrication + " " + p.title + " " + (p.abstract || "")),
  polyjet:    (p) => /polyjet|multi-material|multimaterial/i.test(p.fabrication + " " + p.title + " " + (p.abstract || "")),
  dlp:        (p) => /dlp|sla|stereolitho|digital light/i.test(p.fabrication + " " + p.title + " " + (p.abstract || "")),
  other:      (p) => /hybrid|laser|cnc|robotic/i.test(p.fabrication + " " + p.title + " " + (p.abstract || "")),
};

// === ACTIVE MATERIAL buckets ===
const MATERIAL_PREDICATES = {
  cellulose:  (p) => /cellulose|wood|hygro/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial),
  hydrogel:   (p) => /hydrogel/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial),
  smp:        (p) => /smp|shape memory polymer|shape-memory polymer/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial),
  lce:        (p) => /lce|liquid crystal/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial),
  magnetic:   (p) => /magnetic|ndfeb|ferromag/i.test(p.title + " " + (p.abstract || "") + " " + p.activeMaterial),
};

// === Default state ===
const DEFAULT_FILTERS = {
  collection: "all",
  search: "",
  yearRange: [2005, 2026],
  stimulus: new Set(),     // empty = no stimulus filter
  fabrication: new Set(),
  material: new Set(),
  geometry: new Set(),
  sortBy: "year",          // "year" | "title"
  sortDir: "desc",         // "asc" | "desc"
};

// === Predicate composer ===
function applyFilters(papers, f) {
  let out = papers;

  // Collection
  const collPred = COLLECTIONS[f.collection]?.predicate || (() => true);
  out = out.filter(collPred);

  // Search
  if (f.search && f.search.trim()) {
    const q = f.search.toLowerCase().trim();
    out = out.filter(p => {
      const hay = (p.title + " " + (p.authors || []).join(" ") + " " + (p.abstract || "") + " " + (p.keywords || []).join(" ")).toLowerCase();
      return hay.includes(q);
    });
  }

  // Year range (papers with no year still show)
  out = out.filter(p => {
    if (!p.year) return true;
    return p.year >= f.yearRange[0] && p.year <= f.yearRange[1];
  });

  // Stimulus (any-of: paper has at least one of selected)
  if (f.stimulus.size > 0) {
    out = out.filter(p => p.stimulus.some(s => f.stimulus.has(s)));
  }

  // Fabrication (any-of)
  if (f.fabrication.size > 0) {
    out = out.filter(p => [...f.fabrication].some(k => FAB_PREDICATES[k]?.(p)));
  }

  // Material (any-of)
  if (f.material.size > 0) {
    out = out.filter(p => [...f.material].some(k => MATERIAL_PREDICATES[k]?.(p)));
  }

  // Geometry (any-of)
  if (f.geometry.size > 0) {
    out = out.filter(p => [...f.geometry].some(k => GEOMETRY_PREDICATES[k]?.(p)));
  }

  // Sort
  out = [...out].sort((a, b) => {
    let cmp = 0;
    if (f.sortBy === "year") cmp = (a.year || 0) - (b.year || 0);
    else if (f.sortBy === "title") cmp = a.title.localeCompare(b.title);
    return f.sortDir === "desc" ? -cmp : cmp;
  });

  return out;
}

// === Filter context + hook ===
const FilterContext = React.createContext(null);

function useFilters() {
  return React.useContext(FilterContext) || {
    filters: window.DEFAULT_FILTERS,
    setFilters: () => {},
    toggleSet: () => () => {},
    setField: () => () => {},
    clearAll: () => {},
    filtered: window.PAPERS || [],
    counts: { collection: {}, stimulus: {}, fabrication: {}, material: {}, geometry: {} },
    yearHist: [],
    total: (window.PAPERS || []).length,
    _stub: true,
  };
}

const FilterProvider = ({ children }) => {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  // Re-render when stars change (so starred/unread collections + counts update live)
  const [starTick, setStarTick] = React.useState(0);
  React.useEffect(() => {
    if (!window.__starsListeners) return;
    const fn = () => setStarTick(t => t + 1);
    window.__starsListeners.add(fn);
    return () => window.__starsListeners.delete(fn);
  }, []);

  // Helpers
  const toggleSet = (key) => (value) => {
    setFilters(f => {
      const next = new Set(f[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...f, [key]: next };
    });
  };

  const setField = (key) => (value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const clearAll = () => setFilters(DEFAULT_FILTERS);

  const filtered = React.useMemo(() => applyFilters(window.PAPERS, filters), [filters, starTick]);

  // Expose filtered list to other screens (DetailScreen reads this for prev/next nav).
  React.useEffect(() => {
    window.__currentFiltered = filtered;
  }, [filtered]);

  // Counts: how many papers in the *full* library match each individual option
  // (independent of other filters — this is the standard filter-rail behaviour)
  const counts = React.useMemo(() => {
    const c = { collection: {}, stimulus: {}, fabrication: {}, material: {}, geometry: {} };
    for (const k of Object.keys(COLLECTIONS)) {
      c.collection[k] = window.PAPERS.filter(COLLECTIONS[k].predicate).length;
    }
    const stims = ["humidity", "mechanical", "heat", "light", "pneumatic", "pH", "magnetic", "water", "electric"];
    for (const s of stims) c.stimulus[s] = window.PAPERS.filter(p => p.stimulus.includes(s)).length;
    for (const k of Object.keys(FAB_PREDICATES)) c.fabrication[k] = window.PAPERS.filter(FAB_PREDICATES[k]).length;
    for (const k of Object.keys(MATERIAL_PREDICATES)) c.material[k] = window.PAPERS.filter(MATERIAL_PREDICATES[k]).length;
    for (const k of Object.keys(GEOMETRY_PREDICATES)) c.geometry[k] = window.PAPERS.filter(GEOMETRY_PREDICATES[k]).length;
    return c;
  }, [starTick]);

  // Year histogram: count per year over all papers (for the bar chart)
  const yearHist = React.useMemo(() => {
    const minY = 2015, maxY = 2026;
    const bars = [];
    for (let y = minY; y <= maxY; y++) {
      bars.push({ year: y, count: window.PAPERS.filter(p => p.year === y).length });
    }
    return bars;
  }, []);

  const value = {
    filters, setFilters, toggleSet, setField, clearAll,
    filtered, counts, yearHist,
    total: window.PAPERS.length,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

window.applyFilters = applyFilters;
window.COLLECTIONS = COLLECTIONS;
window.GEOMETRY_PREDICATES = GEOMETRY_PREDICATES;
window.FAB_PREDICATES = FAB_PREDICATES;
window.MATERIAL_PREDICATES = MATERIAL_PREDICATES;
window.DEFAULT_FILTERS = DEFAULT_FILTERS;
window.FilterContext = FilterContext;
window.FilterProvider = FilterProvider;
window.useFilters = useFilters;
