// Main hub view: sidebar + matrix table + filter rail
// Lab notebook aesthetic — tactile, paper-like, with hand-drawn touches

const SidebarItem = ({ collKey, label, icon }) => {
  const f = useFilters();
  const active = f.filters.collection === collKey;
  const count = f.counts.collection[collKey];
  return (
    <div onClick={() => f.setField("collection")(collKey)} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 10px", borderRadius: 3,
      background: active ? "rgba(168, 71, 43, 0.10)" : "transparent",
      borderLeft: active ? `2px solid ${TOKENS.accent}` : "2px solid transparent",
      color: active ? TOKENS.accent : TOKENS.ink,
      fontFamily: FONTS.serif, fontSize: 14,
      cursor: "pointer",
      transition: "background 0.12s",
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(60,40,20,0.04)"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <span style={{ fontSize: 12, width: 14, color: active ? TOKENS.accent : TOKENS.inkFaint }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: active ? 500 : 400 }}>{label}</span>
      {count != null && (
        <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint }}>{count}</span>
      )}
    </div>
  );
};

// Inert sidebar item (for "+ New idea", static list items)
const SidebarItemInert = ({ label, count, icon }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "7px 10px", borderRadius: 3,
    color: TOKENS.ink,
    fontFamily: FONTS.serif, fontSize: 14,
    cursor: "default",
  }}>
    <span style={{ fontSize: 12, width: 14, color: TOKENS.inkFaint }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {count != null && (
      <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint }}>{count}</span>
    )}
  </div>
);

const SidebarHeading = ({ children }) => (
  <div style={{
    fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
    color: TOKENS.inkFaint, padding: "16px 12px 6px",
  }}>{children}</div>
);

const Sidebar = () => {
  return (
  <PaperTexture deep style={{
    width: 240, borderRight: `1px solid ${TOKENS.rule}`,
    paddingTop: 0, position: "relative",
    boxShadow: "inset -8px 0 16px -10px rgba(60,40,20,0.18)",
    overflow: "auto",
  }}>
    {/* Notebook header strip */}
    <div style={{
      padding: "18px 18px 14px", borderBottom: `1px solid ${TOKENS.rule}`,
      background: "linear-gradient(180deg, rgba(168,71,43,0.06), transparent)",
    }}>
      <div style={{
        fontFamily: FONTS.display, fontSize: 22, fontWeight: 600, color: TOKENS.ink,
        lineHeight: 1, letterSpacing: -0.5,
      }}>Folio</div>
      <div style={{
        fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
        color: TOKENS.inkSoft, marginTop: 2,
      }}>4D printing · research matrix</div>
    </div>

    <SidebarHeading>Library</SidebarHeading>
    <SidebarItem collKey="all" icon="◉" label="All papers" />
    <SidebarItem collKey="starred" icon="★" label="Starred" />
    <SidebarItem collKey="fourD" icon="◐" label="4D printing" />
    <SidebarItem collKey="unread" icon="◇" label="Unread" />

    <SidebarHeading>Collections</SidebarHeading>
    <SidebarItem collKey="hygromorph" icon="❋" label="Hygromorphs" />
    <SidebarItem collKey="bistable" icon="✦" label="Bistable structures" />
    <SidebarItem collKey="origami" icon="✱" label="Origami / kirigami" />
    <SidebarItem collKey="soft" icon="◈" label="Soft robotics" />
    <SidebarItem collKey="biomimicry" icon="◊" label="Biomimicry" />

    <SidebarHeading>My ideas</SidebarHeading>
    <SidebarItemInert icon="✎" label="Bistable hygromorph hybrid" count={6} />
    <SidebarItemInert icon="✎" label="Cellulose + SME bilayer" count={3} />
    <SidebarItemInert icon="+" label="New idea…" />

    <div style={{
      position: "absolute", bottom: 16, left: 16, right: 16,
      padding: "10px 12px",
      background: "rgba(255,255,255,0.4)",
      border: `1px dashed ${TOKENS.rule}`,
      borderRadius: 3,
      fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
      color: TOKENS.inkSoft, lineHeight: 1.4,
    }}>
      <span style={{ fontFamily: FONTS.display, fontSize: 12, fontWeight: 600, color: TOKENS.accent }}>R. Xie</span>
      <br />66 papers · last sync 2h ago
    </div>
  </PaperTexture>
  );
};

// Matrix toolbar — sort, group, axis builder trigger
const Toolbar = ({ onAxisOpen }) => {
  const f = useFilters();
  return (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 24px", borderBottom: `1px solid ${TOKENS.rule}`,
    background: "rgba(255, 250, 240, 0.5)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint, letterSpacing: 0.8 }}>SEARCH</span>
      <input
        type="text"
        value={f.filters.search}
        onChange={(e) => f.setField("search")(e.target.value)}
        placeholder="title, author, keyword…"
        style={{
          flex: 1, maxWidth: 360, padding: "5px 10px",
          background: "rgba(255,255,255,0.5)",
          border: `1px solid ${f.filters.search ? TOKENS.accent : TOKENS.rule}`, borderRadius: 2,
          fontFamily: FONTS.serif, fontSize: 13,
          color: TOKENS.ink,
          outline: "none",
        }}
      />
      {f.filters.search && (
        <span onClick={() => f.setField("search")("")} style={{
          fontFamily: FONTS.mono, fontSize: 11, color: TOKENS.accent, cursor: "pointer",
        }}>✕</span>
      )}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <ToolbarButton onClick={onAxisOpen} accent>
        <span style={{ fontSize: 13, marginRight: 4 }}>✎</span>
        Configure axes
      </ToolbarButton>
      <ToolbarButton onClick={() => {
        if (f.filters.sortBy === "year") f.setField("sortDir")(f.filters.sortDir === "desc" ? "asc" : "desc");
        else f.setFilters(s => ({ ...s, sortBy: "year", sortDir: "desc" }));
      }}>
        Sort: {f.filters.sortBy === "year" ? "Year" : "Title"} {f.filters.sortDir === "desc" ? "↓" : "↑"}
      </ToolbarButton>
      <ToolbarButton onClick={f.clearAll} dim={!hasAnyFilter(f.filters)}>
        Clear all
      </ToolbarButton>
      <div style={{ width: 1, height: 18, background: TOKENS.rule, margin: "0 4px" }} />
      <ToolbarButton>⊞ Matrix</ToolbarButton>
      <ToolbarButton dim>⊟ Cards</ToolbarButton>
      <ToolbarButton dim>◔ Charts</ToolbarButton>
    </div>
  </div>
  );
};

const hasAnyFilter = (s) => s.collection !== "all" || s.search || s.stimulus.size || s.fabrication.size || s.material.size || s.geometry.size || s.yearRange[0] !== 2005 || s.yearRange[1] !== 2026;

const ToolbarButton = ({ children, accent, dim, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: FONTS.serif, fontSize: 12,
    color: accent ? TOKENS.accent : dim ? TOKENS.inkFaint : TOKENS.ink,
    background: accent ? "rgba(168,71,43,0.08)" : "transparent",
    border: `1px solid ${accent ? TOKENS.accent : TOKENS.rule}`,
    borderRadius: 2,
    padding: "4px 10px",
    cursor: "pointer",
    display: "inline-flex", alignItems: "center",
    whiteSpace: "nowrap",
  }}>{children}</button>
);

// THE MATRIX TABLE
const MatrixHeader = ({ columns }) => {
  const f = useFilters();
  return (
  <div style={{
    display: "grid",
    gridTemplateColumns: columns.map((c) => c.width).join(" "),
    background: "rgba(234, 223, 203, 0.6)",
    borderBottom: `2px solid ${TOKENS.ink}`,
    position: "sticky", top: 0, zIndex: 2,
  }}>
    {columns.map((c, i) => {
      const isActive = c.sortable && f.filters.sortBy === c.key;
      return (
      <div key={i}
        onClick={c.sortable ? () => {
          if (f.filters.sortBy === c.key) f.setField("sortDir")(f.filters.sortDir === "desc" ? "asc" : "desc");
          else f.setFilters(s => ({ ...s, sortBy: c.key, sortDir: "desc" }));
        } : undefined}
        style={{
          padding: "10px 14px",
          fontFamily: FONTS.mono, fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase",
          color: isActive ? TOKENS.accent : TOKENS.ink, fontWeight: 600,
          borderRight: i < columns.length - 1 ? `1px solid ${TOKENS.rule}` : "none",
          display: "flex", alignItems: "center", gap: 4,
          cursor: c.sortable ? "pointer" : "default",
          userSelect: "none",
        }}>
        {c.label}
        {c.sortable && (
          <span style={{ color: isActive ? TOKENS.accent : TOKENS.inkFaint, fontSize: 10 }}>
            {isActive ? (f.filters.sortDir === "desc" ? "↓" : "↑") : "↕"}
          </span>
        )}
      </div>
      );
    })}
  </div>
  );
};

const MatrixRow = ({ paper, columns, alt, highlight, onClick }) => (
  <div
    onClick={onClick}
    style={{
    display: "grid",
    gridTemplateColumns: columns.map((c) => c.width).join(" "),
    background: highlight ? "rgba(245,215,126,0.18)" : alt ? "rgba(255,250,240,0.35)" : "transparent",
    borderBottom: `1px solid ${TOKENS.ruleFaint}`,
    minHeight: 76,
    position: "relative",
    cursor: onClick ? "pointer" : "default",
    transition: "background 0.1s",
  }}
    onMouseEnter={(e) => {
      if (!onClick || highlight) return;
      e.currentTarget.style.background = "rgba(168,71,43,0.05)";
    }}
    onMouseLeave={(e) => {
      if (!onClick || highlight) return;
      e.currentTarget.style.background = alt ? "rgba(255,250,240,0.35)" : "transparent";
    }}>
    {columns.map((c, i) => (
      <div key={i} style={{
        padding: "10px 14px",
        borderRight: i < columns.length - 1 ? `1px dashed ${TOKENS.ruleFaint}` : "none",
        display: "flex", alignItems: c.align || "center",
        fontFamily: FONTS.serif, fontSize: 12.5,
        color: TOKENS.ink, lineHeight: 1.4,
        overflow: "hidden",
      }}>
        {c.render(paper)}
      </div>
    ))}
  </div>
);

const COLUMNS = [
  {
    key: "thumb", label: "", width: "80px",
    render: (p) => <ClickableThumb paper={p} />,
  },
  {
    key: "title", label: "Title", width: "minmax(280px, 2fr)", sortable: true,
    align: "flex-start",
    render: (p) => (
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ marginTop: 2 }}><StarToggle paperId={p.id} /></span>
          <div>
            <div style={{
              fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 500,
              color: TOKENS.ink, lineHeight: 1.3,
            }}>{p.title}</div>
            <div style={{
              fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
              color: TOKENS.inkSoft, marginTop: 3,
            }}>
              {p.authors.slice(0, 2).join(", ")}
              {p.authors.length > 2 && ` +${p.authors.length - 2}`}
              {" · "}<span style={{ color: TOKENS.inkFaint }}>{p.venue}</span>
            </div>
            <div style={{ marginTop: 5, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {p.bistable && <Tag color={TOKENS.accent} bg="rgba(168,71,43,0.08)">bistable</Tag>}
              {p.miura && <Tag color={TOKENS.teal} bg="rgba(47,111,117,0.08)">miura</Tag>}
              {p.is4D && <Tag color={TOKENS.sage}>4D</Tag>}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "year", label: "Year", width: "70px", sortable: true,
    render: (p) => (
      <div style={{
        fontFamily: FONTS.mono, fontSize: 14, color: TOKENS.ink,
        letterSpacing: 0.5,
      }}>{p.year}</div>
    ),
  },
  {
    key: "fab", label: "Fabrication", width: "150px",
    align: "flex-start",
    render: (p) => (
      <div style={{ paddingTop: 12, fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink }}>
        {p.fabrication}
      </div>
    ),
  },
  {
    key: "active", label: "Active material", width: "180px",
    align: "flex-start",
    render: (p) => (
      <div style={{ paddingTop: 12 }}>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink,
          fontWeight: 500,
        }}>{p.activeMaterial}</div>
        {p.passiveMaterial && p.passiveMaterial !== "—" && (
          <div style={{
            fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
            color: TOKENS.inkFaint, marginTop: 2,
          }}>+ {p.passiveMaterial}</div>
        )}
      </div>
    ),
  },
  {
    key: "stim", label: "Stimulus", width: "150px",
    align: "flex-start",
    render: (p) => (
      <div style={{ paddingTop: 14, display: "flex", flexWrap: "wrap", gap: 3 }}>
        {p.stimulus.map((s) => <StimTag key={s} kind={s} />)}
      </div>
    ),
  },
  {
    key: "time", label: "Shape time", width: "100px",
    render: (p) => (
      <div style={{
        fontFamily: FONTS.mono, fontSize: 11, color: TOKENS.ink,
      }}>{p.shapeChangeTime}</div>
    ),
  },
  {
    key: "future", label: "Future potential", width: "minmax(180px, 1.2fr)",
    align: "flex-start",
    render: (p) => (
      <div style={{
        paddingTop: 10,
        fontFamily: FONTS.serif, fontSize: 11.5, fontStyle: "italic",
        color: TOKENS.inkSoft, lineHeight: 1.4,
      }}>{p.futurePotential}</div>
    ),
  },
];

const MatrixView = () => {
  const [columns] = React.useState(COLUMNS);
  const f = useFilters();
  const sorted = f.filtered;
  const selected = window.useSelected ? window.useSelected() : "p004";

  return (
    <div style={{ flex: 1, overflow: "auto", background: TOKENS.paper }}>
      <MatrixHeader columns={columns} />
      <div>
        {sorted.length === 0 && (
          <div style={{
            padding: "60px 24px", textAlign: "center",
            fontFamily: FONTS.serif, fontSize: 14, fontStyle: "italic",
            color: TOKENS.inkSoft,
          }}>
            <div style={{ fontFamily: FONTS.hand, fontSize: 22, color: TOKENS.accent, marginBottom: 8 }}>
              No papers match these filters.
            </div>
            <div onClick={f.clearAll} style={{
              cursor: "pointer", color: TOKENS.accent, textDecoration: "underline",
              textDecorationStyle: "dashed", textUnderlineOffset: 3,
            }}>clear all filters →</div>
          </div>
        )}
        {sorted.map((p, i) => (
          <MatrixRow
            key={p.id}
            paper={p}
            columns={columns}
            alt={i % 2 === 1}
            highlight={p.id === selected}
            onClick={() => window.setSelected && window.setSelected(p.id)}
          />
        ))}
      </div>
      {/* Bottom decoration */}
      <div style={{
        padding: "20px 24px", textAlign: "center",
        fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
        color: TOKENS.inkFaint,
      }}>
        — end of folio · {sorted.length} of {f.total} papers shown —
      </div>
    </div>
  );
};

// Filter rail (right side)
const FilterGroup = ({ title, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{
      fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
      color: TOKENS.inkFaint, marginBottom: 8,
      paddingBottom: 4, borderBottom: `1px solid ${TOKENS.ruleFaint}`,
    }}>{title}</div>
    {children}
  </div>
);

const FilterCheck = ({ label, count, category, value }) => {
  const f = useFilters();
  const on = f.filters[category]?.has?.(value) || false;
  const dim = count === 0;
  return (
    <div onClick={dim ? undefined : () => f.toggleSet(category)(value)} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "3px 2px",
      fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink,
      cursor: dim ? "default" : "pointer",
      opacity: dim ? 0.45 : 1,
      borderRadius: 2,
    }}
    onMouseEnter={(e) => { if (!dim) e.currentTarget.style.background = "rgba(60,40,20,0.04)"; }}
    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
      <div style={{
        width: 12, height: 12, border: `1.5px solid ${on ? TOKENS.accent : TOKENS.inkFaint}`,
        background: on ? TOKENS.accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 1, flexShrink: 0,
      }}>
        {on && <span style={{ color: TOKENS.paperLight, fontSize: 10, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ flex: 1, color: on ? TOKENS.ink : TOKENS.inkSoft, fontWeight: on ? 500 : 400 }}>{label}</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint }}>{count}</span>
    </div>
  );
};

const FilterRail = () => {
  const f = useFilters();
  return (
  <PaperTexture style={{
    width: 240, borderLeft: `1px solid ${TOKENS.rule}`,
    padding: "16px 18px",
    boxShadow: "inset 8px 0 16px -10px rgba(60,40,20,0.10)",
    overflow: "auto",
  }}>
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      marginBottom: 4,
    }}>
      <div style={{
        fontFamily: FONTS.display, fontSize: 14, fontWeight: 600, color: TOKENS.ink,
        letterSpacing: 0.3, textTransform: "uppercase",
      }}>Filters</div>
      {hasAnyFilter(f.filters) && (
        <span onClick={f.clearAll} style={{
          fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
          color: TOKENS.accent, cursor: "pointer",
        }}>clear</span>
      )}
    </div>
    <div style={{
      fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
      color: TOKENS.inkFaint, marginBottom: 16,
    }}>{f.total} → <span style={{ color: TOKENS.accent, fontWeight: 600 }}>{f.filtered.length}</span> papers</div>

    <FilterGroup title="Year">
      <div style={{
        height: 32, background: "rgba(255,255,255,0.4)",
        border: `1px solid ${TOKENS.ruleFaint}`,
        position: "relative", marginBottom: 6,
      }}>
        {f.yearHist.map((b, i) => {
          const max = Math.max(...f.yearHist.map(x => x.count));
          const inRange = b.year >= f.filters.yearRange[0] && b.year <= f.filters.yearRange[1];
          return (
          <div key={b.year}
            onClick={() => f.setField("yearRange")([b.year, b.year])}
            title={`${b.year}: ${b.count}`}
            style={{
              position: "absolute", bottom: 0,
              left: `${i * (100 / f.yearHist.length)}%`,
              width: `${100 / f.yearHist.length - 1}%`,
              height: `${(b.count / Math.max(max,1)) * 100}%`,
              background: inRange ? TOKENS.accent : TOKENS.rule,
              opacity: inRange ? 0.7 : 0.35,
              cursor: "pointer",
            }} />
          );
        })}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint,
      }}>
        <span>2015</span>
        <span style={{ color: TOKENS.accent, cursor: "pointer" }}
          onClick={() => f.setField("yearRange")([2005, 2026])}>
          {f.filters.yearRange[0]} — {f.filters.yearRange[1]}
        </span>
        <span>2026</span>
      </div>
    </FilterGroup>

    <FilterGroup title="Stimulus">
      <FilterCheck category="stimulus" value="humidity"   label="humidity"    count={f.counts.stimulus.humidity} />
      <FilterCheck category="stimulus" value="mechanical" label="mechanical"  count={f.counts.stimulus.mechanical} />
      <FilterCheck category="stimulus" value="heat"       label="heat"        count={f.counts.stimulus.heat} />
      <FilterCheck category="stimulus" value="light"      label="light"       count={f.counts.stimulus.light} />
      <FilterCheck category="stimulus" value="pneumatic"  label="pneumatic"   count={f.counts.stimulus.pneumatic} />
      <FilterCheck category="stimulus" value="pH"         label="pH"          count={f.counts.stimulus.pH} />
      <FilterCheck category="stimulus" value="magnetic"   label="magnetic"    count={f.counts.stimulus.magnetic} />
    </FilterGroup>

    <FilterGroup title="Fabrication">
      <FilterCheck category="fabrication" value="fdm"     label="FDM / FFF"               count={f.counts.fabrication.fdm} />
      <FilterCheck category="fabrication" value="general" label="3D-print (general)"      count={f.counts.fabrication.general} />
      <FilterCheck category="fabrication" value="polyjet" label="PolyJet / multi-material" count={f.counts.fabrication.polyjet} />
      <FilterCheck category="fabrication" value="dlp"     label="DLP / SLA"               count={f.counts.fabrication.dlp} />
      <FilterCheck category="fabrication" value="other"   label="Other / hybrid"          count={f.counts.fabrication.other} />
    </FilterGroup>

    <FilterGroup title="Active material">
      <FilterCheck category="material" value="cellulose" label="Cellulose / wood"  count={f.counts.material.cellulose} />
      <FilterCheck category="material" value="hydrogel"  label="Hydrogel"          count={f.counts.material.hydrogel} />
      <FilterCheck category="material" value="smp"       label="SMP"               count={f.counts.material.smp} />
      <FilterCheck category="material" value="lce"       label="LCE"               count={f.counts.material.lce} />
      <FilterCheck category="material" value="magnetic"  label="Magnetic composite" count={f.counts.material.magnetic} />
    </FilterGroup>

    <FilterGroup title="Geometry">
      <FilterCheck category="geometry" value="bistable" label="Bistable / multistable" count={f.counts.geometry.bistable} />
      <FilterCheck category="geometry" value="origami"  label="Origami / kirigami"     count={f.counts.geometry.origami} />
      <FilterCheck category="geometry" value="bilayer"  label="Bilayer"                 count={f.counts.geometry.bilayer} />
      <FilterCheck category="geometry" value="lattice"  label="Lattice / metamaterial"  count={f.counts.geometry.lattice} />
      <FilterCheck category="geometry" value="shell"    label="Shell / curved"          count={f.counts.geometry.shell} />
    </FilterGroup>

    <FilterGroup title="Shape-change time">
      <div style={{
        height: 24, position: "relative",
        background: `linear-gradient(90deg, ${TOKENS.teal}, ${TOKENS.ochre}, ${TOKENS.accent})`,
        opacity: 0.4, marginBottom: 6,
      }} />
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint,
      }}>
        <span>&lt;1s</span><span>1min</span><span>1h</span>
      </div>
    </FilterGroup>
  </PaperTexture>
  );
};

// Top bar with breadcrumb + extract button
const TopBar = () => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "10px 24px", borderBottom: `1px solid ${TOKENS.rule}`,
    background: TOKENS.paperDeep,
    boxShadow: "0 1px 0 rgba(60,40,20,0.06)",
  }}>
    <div style={{
      fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.inkSoft,
    }}>
      <span style={{ color: TOKENS.inkFaint }}>Library</span>
      <span style={{ margin: "0 6px", color: TOKENS.inkFaint }}>/</span>
      <span style={{ color: TOKENS.ink, fontWeight: 500 }}>All papers</span>
    </div>
    <div style={{ flex: 1 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
        color: TOKENS.inkSoft,
      }}>
        Last extraction: <span style={{ color: TOKENS.sage, fontFamily: FONTS.mono, fontStyle: "normal" }}>● 2 papers</span> in queue
      </span>
      <ToolbarButton accent>
        <span style={{ marginRight: 4 }}>+</span>Add PDFs
      </ToolbarButton>
    </div>
  </div>
);

// FULL HUB SCREEN
const HubScreen = () => (
  <FilterProvider>
    <div style={{
      width: 1440, height: 900,
      display: "flex", flexDirection: "column",
      fontFamily: FONTS.serif,
      background: TOKENS.paper,
      color: TOKENS.ink,
      overflow: "hidden",
      border: `1px solid ${TOKENS.rule}`,
    }}>
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Toolbar />
          <MatrixView />
        </div>
        <FilterRail />
      </div>
    </div>
  </FilterProvider>
);

window.HubScreen = HubScreen;
window.Sidebar = Sidebar;
window.Toolbar = Toolbar;
window.ToolbarButton = ToolbarButton;
window.TopBar = TopBar;
window.MatrixView = MatrixView;
window.FilterRail = FilterRail;
window.COLUMNS = COLUMNS;
