// Functional axis builder — real HTML5 drag-and-drop + live pivot table
// Drag any field chip from the palette to the Row or Column zone.
// The pivot table recomputes immediately from all 66+ real papers.
// Click a populated cell to see which papers fall there.

// ── Field definitions ────────────────────────────────────────────────────────
// Each axis field describes how to bucket papers into discrete values.

const AXIS_FIELDS = [
  {
    id: "stimulus",
    label: "Stimulus",
    icon: "✿",
    getValues: () => ["humidity", "water", "mechanical", "heat", "light", "pH", "magnetic", "electric"],
    getLabel: (v) => v,
    matchPaper: (v) => (p) => Array.isArray(p.stimulus) && p.stimulus.includes(v),
  },
  {
    id: "fabrication",
    label: "Fabrication",
    icon: "✦",
    getValues: () => ["fdm", "general", "polyjet", "dlp", "other"],
    getLabel: (v) => ({ fdm: "FDM/FFF", general: "3D-print", polyjet: "PolyJet", dlp: "DLP/SLA", other: "Other" }[v] || v),
    matchPaper: (v) => (window.FAB_PREDICATES && window.FAB_PREDICATES[v]) || (() => false),
  },
  {
    id: "material",
    label: "Active material",
    icon: "◉",
    getValues: () => ["cellulose", "hydrogel", "smp", "lce", "magnetic"],
    getLabel: (v) => ({ cellulose: "Cellulose/wood", hydrogel: "Hydrogel", smp: "SMP", lce: "LCE", magnetic: "Magnetic" }[v] || v),
    matchPaper: (v) => (window.MATERIAL_PREDICATES && window.MATERIAL_PREDICATES[v]) || (() => false),
  },
  {
    id: "geometry",
    label: "Geometry",
    icon: "⬡",
    getValues: () => ["bistable", "origami", "bilayer", "lattice", "shell"],
    getLabel: (v) => ({ bistable: "Bistable", origami: "Origami/kirigami", bilayer: "Bilayer", lattice: "Lattice/meta", shell: "Shell/curved" }[v] || v),
    matchPaper: (v) => (window.GEOMETRY_PREDICATES && window.GEOMETRY_PREDICATES[v]) || (() => false),
  },
  {
    id: "is4D",
    label: "Is 4D printing?",
    icon: "4D",
    getValues: () => ["yes", "no"],
    getLabel: (v) => v === "yes" ? "4D printing" : "Not 4D",
    matchPaper: (v) => (p) => v === "yes" ? !!p.is4D : !p.is4D,
  },
  {
    id: "bistable_tag",
    label: "Bistable?",
    icon: "⟺",
    getValues: () => ["bistable", "not bistable"],
    getLabel: (v) => v,
    matchPaper: (v) => (p) => v === "bistable" ? !!p.bistable : !p.bistable,
  },
  {
    id: "year_era",
    label: "Era",
    icon: "📅",
    getValues: () => ["pre-2018", "2018–2020", "2021–2022", "2023–2024", "2025+"],
    getLabel: (v) => v,
    matchPaper: (v) => {
      if (v === "pre-2018")  return (p) => p.year && p.year < 2018;
      if (v === "2018–2020") return (p) => p.year && p.year >= 2018 && p.year <= 2020;
      if (v === "2021–2022") return (p) => p.year && p.year >= 2021 && p.year <= 2022;
      if (v === "2023–2024") return (p) => p.year && p.year >= 2023 && p.year <= 2024;
      if (v === "2025+")     return (p) => p.year && p.year >= 2025;
      return () => false;
    },
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

const AxisFieldChip = ({ field, placed, onDragStart, onDragEnd, onRemove }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart && onDragStart(); }}
      onDragEnd={() => onDragEnd && onDragEnd()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "6px 10px",
        background: placed
          ? `rgba(31,95,181,0.10)`
          : hover ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
        border: `1px ${placed ? "solid" : "solid"} ${placed ? TOKENS.accent : hover ? TOKENS.inkSoft : TOKENS.rule}`,
        borderRadius: 3,
        fontFamily: FONTS.serif, fontSize: 12.5,
        color: placed ? TOKENS.accent : TOKENS.ink,
        cursor: "grab",
        userSelect: "none",
        transition: "all 0.1s",
        boxShadow: hover ? "0 2px 6px rgba(20,30,50,0.10)" : "none",
      }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: placed ? TOKENS.accent : TOKENS.inkFaint, minWidth: 14 }}>
        {field.icon}
      </span>
      <span style={{ flex: 1 }}>{field.label}</span>
      {placed && onRemove && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ marginLeft: 4, color: TOKENS.inkFaint, fontSize: 12, cursor: "pointer", lineHeight: 1 }}
          title="Remove">×</span>
      )}
    </div>
  );
};

const AxisDropZone = ({ label, hint, field, isDragOver, onDragOver, onDragLeave, onDrop, onRemove, highlighted }) => (
  <div
    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver && onDragOver(); }}
    onDragLeave={onDragLeave}
    onDrop={(e) => { e.preventDefault(); onDrop && onDrop(); }}
    style={{
      flex: 1,
      minHeight: 80,
      padding: "12px 14px",
      background: isDragOver
        ? `rgba(31,95,181,0.08)`
        : highlighted ? `${TOKENS.highlight}33` : "rgba(255,255,255,0.3)",
      border: `2px dashed ${isDragOver ? TOKENS.accent : highlighted ? TOKENS.accent : TOKENS.rule}`,
      borderRadius: 3,
      transition: "all 0.12s",
    }}>
    <div style={{
      fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
      color: highlighted ? TOKENS.accent : TOKENS.inkFaint, marginBottom: 4,
    }}>{label}</div>
    <div style={{
      fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
      color: TOKENS.inkSoft, marginBottom: 10,
    }}>{hint}</div>
    {field ? (
      <AxisFieldChip field={field} placed onRemove={onRemove} />
    ) : (
      <div style={{
        display: "inline-flex", alignItems: "center",
        fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
        color: isDragOver ? TOKENS.accent : TOKENS.inkFaint,
        padding: "4px 8px",
        border: `1px dashed ${isDragOver ? TOKENS.accent : TOKENS.ruleFaint}`,
      }}>
        {isDragOver ? "drop here →" : "drag a field here"}
      </div>
    )}
  </div>
);

// Single pivot cell
const PivotCell = ({ papers, maxCount, onClick }) => {
  const [hover, setHover] = React.useState(false);
  const count = papers.length;
  const intensity = maxCount > 0 ? count / maxCount : 0;
  const empty = count === 0;

  const bgColor = empty
    ? "rgba(255,255,255,0.3)"
    : hover
      ? `rgba(31,95,181,${0.12 + intensity * 0.60})`
      : `rgba(31,95,181,${0.06 + intensity * 0.44})`;

  return (
    <div
      onClick={!empty ? onClick : undefined}
      onMouseEnter={() => !empty && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minHeight: 64, padding: 4,
        background: bgColor,
        border: empty ? `1px dashed ${TOKENS.ruleFaint}` : `1px solid ${hover ? TOKENS.accent : TOKENS.ruleFaint}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 3, cursor: empty ? "default" : "pointer",
        transition: "background 0.12s, border-color 0.12s",
      }}>
      {empty ? (
        <span style={{ fontFamily: FONTS.hand, fontSize: 13, color: TOKENS.ruleFaint }}>—</span>
      ) : count <= 3 ? (
        // Show thumbnails for small cells
        <React.Fragment>
          <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            {papers.map(p => {
              const userThumb = window.getThumbnail && window.getThumbnail(p.id);
              return (
                <div key={p.id} style={{
                  width: 24, height: 24, overflow: "hidden",
                  border: `1px solid ${TOKENS.ruleFaint}`, background: TOKENS.paperLight,
                  flexShrink: 0,
                }}>
                  {userThumb
                    ? <img src={userThumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Thumb kind={p.thumb} size={24} />}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 8, color: intensity > 0.55 ? "rgba(255,255,255,0.75)" : TOKENS.inkFaint }}>
            {count} paper{count !== 1 ? "s" : ""}
          </div>
        </React.Fragment>
      ) : (
        // Show count for larger cells
        <React.Fragment>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 20, fontWeight: 700, lineHeight: 1,
            color: intensity > 0.55 ? TOKENS.paperLight : TOKENS.ink,
          }}>{count}</div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 8,
            color: intensity > 0.55 ? "rgba(255,255,255,0.7)" : TOKENS.inkFaint,
          }}>papers</div>
        </React.Fragment>
      )}
    </div>
  );
};

// Full pivot grid
const PivotTable = ({ rowDef, colDef, onCellClick }) => {
  const papers = window.PAPERS || [];
  const rowValues = rowDef.getValues();
  const colValues = colDef.getValues();

  // Build pivot data
  const pivot = React.useMemo(() => {
    return rowValues.map(rv => {
      const rowPred = rowDef.matchPaper(rv);
      return {
        label: rowDef.getLabel(rv),
        total: papers.filter(rowPred).length,
        cells: colValues.map(cv => {
          const colPred = colDef.matchPaper(cv);
          return {
            label: colDef.getLabel(cv),
            papers: papers.filter(p => rowPred(p) && colPred(p)),
          };
        }),
      };
    });
  }, [rowDef.id, colDef.id, papers.length]);

  const maxCount = Math.max(...pivot.flatMap(r => r.cells.map(c => c.papers.length)), 1);
  const totalPapers = papers.length;
  const coveredPapers = new Set(pivot.flatMap(r => r.cells.flatMap(c => c.papers.map(p => p.id)))).size;

  return (
    <div style={{ overflow: "auto" }}>
      {/* Coverage note */}
      <div style={{
        fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
        color: TOKENS.inkSoft, marginBottom: 10,
      }}>
        Showing {coveredPapers} of {totalPapers} papers matched by these axes.
        {coveredPapers < totalPapers && (
          <span style={{ color: TOKENS.ochre }}>
            {" "}{totalPapers - coveredPapers} papers have no value for one or both fields.
          </span>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `140px repeat(${colValues.length}, minmax(72px, 1fr))`,
        gap: 2,
        background: TOKENS.rule,
        minWidth: "max-content",
        border: `1px solid ${TOKENS.rule}`,
      }}>
        {/* Header row */}
        <div style={{
          background: TOKENS.paperDeep, padding: "8px 10px",
          fontFamily: FONTS.mono, fontSize: 8.5, color: TOKENS.inkFaint, letterSpacing: 0.8,
          display: "flex", alignItems: "flex-end",
        }}>
          {rowDef.label} ↓ / {colDef.label} →
        </div>
        {colValues.map(cv => (
          <div key={cv} style={{
            background: TOKENS.paperDeep, padding: "8px 6px",
            fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.ink, textAlign: "center",
            letterSpacing: 0.3, lineHeight: 1.3,
          }}>{colDef.getLabel(cv)}</div>
        ))}

        {/* Data rows */}
        {pivot.map((row, ri) => (
          <React.Fragment key={rowValues[ri]}>
            <div style={{
              background: TOKENS.paperLight, padding: "8px 10px",
              fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink,
              fontStyle: "italic", display: "flex", alignItems: "center", gap: 6,
              lineHeight: 1.3,
            }}>
              <span style={{ flex: 1 }}>{row.label}</span>
              {row.total > 0 && (
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint }}>
                  ({row.total})
                </span>
              )}
            </div>
            {row.cells.map((cell, ci) => (
              <PivotCell
                key={colValues[ci]}
                papers={cell.papers}
                maxCount={maxCount}
                onClick={() => onCellClick(rowValues[ri], colValues[ci], cell.papers)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Cell detail overlay — shown when you click a populated pivot cell
const CellModal = ({ rowLabel, colLabel, papers, onClose, onSelectPaper }) => {
  // Esc to close
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 50,
      background: "rgba(20,30,50,0.38)",
      backdropFilter: "blur(1px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 460, maxHeight: 540,
        background: TOKENS.paperLight,
        border: `1px solid ${TOKENS.accent}`,
        boxShadow: "0 10px 36px rgba(20,30,50,0.22)",
        display: "flex", flexDirection: "column",
        borderRadius: 2,
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${TOKENS.rule}`,
          background: TOKENS.paperDeep,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: 14, fontWeight: 600, color: TOKENS.ink,
            }}>
              {rowLabel}
              <span style={{ color: TOKENS.inkFaint, fontWeight: 400 }}> × </span>
              {colLabel}
            </div>
            <div style={{
              fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
              color: TOKENS.inkSoft, marginTop: 2,
            }}>
              {papers.length} paper{papers.length !== 1 ? "s" : ""} at this intersection
            </div>
          </div>
          <span onClick={onClose} style={{
            cursor: "pointer", fontFamily: FONTS.mono, fontSize: 15,
            color: TOKENS.inkFaint, padding: "2px 6px",
          }}>✕</span>
        </div>

        {/* Paper list */}
        <div style={{ overflow: "auto", flex: 1, padding: "8px 0" }}>
          {papers.map(p => {
            const userThumb = window.getThumbnail && window.getThumbnail(p.id);
            return (
              <div
                key={p.id}
                onClick={() => onSelectPaper(p.id)}
                style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "10px 20px",
                  borderBottom: `1px dashed ${TOKENS.ruleFaint}`,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = `rgba(31,95,181,0.06)`}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  border: `1px solid ${TOKENS.rule}`,
                  background: TOKENS.paper, padding: 1, overflow: "hidden",
                }}>
                  {userThumb
                    ? <img src={userThumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Thumb kind={p.thumb} size={36} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: FONTS.display, fontSize: 12.5, fontWeight: 500,
                    color: TOKENS.ink, lineHeight: 1.3,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{p.title}</div>
                  <div style={{
                    fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
                    color: TOKENS.inkSoft, marginTop: 2,
                  }}>
                    {(p.authors || []).slice(0, 2).join(", ")}
                    {(p.authors || []).length > 2 && ` +${p.authors.length - 2}`}
                    {p.year ? ` · ${p.year}` : ""}
                  </div>
                  <div style={{ marginTop: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {p.bistable && <Tag color={TOKENS.accent} bg={`rgba(31,95,181,0.06)`}>bistable</Tag>}
                    {p.is4D && <Tag color={TOKENS.sage}>4D</Tag>}
                    {p.miura && <Tag color={TOKENS.teal}>miura</Tag>}
                  </div>
                </div>
                <span style={{
                  fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
                  color: TOKENS.accent, flexShrink: 0, alignSelf: "center",
                }}>open →</span>
              </div>
            );
          })}
        </div>

        <div style={{
          padding: "10px 20px", borderTop: `1px solid ${TOKENS.rule}`,
          fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
          color: TOKENS.inkSoft, textAlign: "right",
        }}>
          Click any paper to open in detail view
        </div>
      </div>
    </div>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────

const AxisBuilderScreen = () => {
  const [rowFieldId, setRowFieldId] = React.useState("stimulus");
  const [colFieldId, setColFieldId] = React.useState("material");
  const [dragFieldId, setDragFieldId] = React.useState(null);
  const [dragOverZone, setDragOverZone] = React.useState(null);
  const [cellModal, setCellModal] = React.useState(null);

  const rowDef = AXIS_FIELDS.find(f => f.id === rowFieldId) || null;
  const colDef = AXIS_FIELDS.find(f => f.id === colFieldId) || null;

  const assignedIds = [rowFieldId, colFieldId].filter(Boolean);
  const availableFields = AXIS_FIELDS.filter(f => !assignedIds.includes(f.id));

  const handleDrop = (zone) => {
    if (!dragFieldId) return;
    setDragOverZone(null);

    if (zone === "row") {
      if (colFieldId === dragFieldId) setColFieldId(null);
      setRowFieldId(dragFieldId);
    } else if (zone === "col") {
      if (rowFieldId === dragFieldId) setRowFieldId(null);
      setColFieldId(dragFieldId);
    } else {
      // dropped on available zone or outside — remove from axes
      if (rowFieldId === dragFieldId) setRowFieldId(null);
      if (colFieldId === dragFieldId) setColFieldId(null);
    }
    setDragFieldId(null);
  };

  const openPaperAndClose = (paperId) => {
    window.setSelected && window.setSelected(paperId);
    setCellModal(null);
  };

  const totalPapers = (window.PAPERS || []).length;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: TOKENS.paper, fontFamily: FONTS.serif,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 32px", borderBottom: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperDeep,
      }}>
        <div style={{
          fontFamily: FONTS.display, fontSize: 22, fontWeight: 600,
          color: TOKENS.ink, letterSpacing: -0.3, lineHeight: 1,
        }}>Configure your matrix</div>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 12.5, fontStyle: "italic",
          color: TOKENS.inkSoft, marginTop: 4,
        }}>
          Drag fields to the Row / Column zones — see a live pivot of your {totalPapers} papers.
          Click any cell to see which papers fall there.
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "20px 28px", gap: 20 }}>
        {/* Left: available fields palette */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOverZone("available"); }}
          onDragLeave={() => { if (dragOverZone === "available") setDragOverZone(null); }}
          onDrop={(e) => { e.preventDefault(); handleDrop("available"); }}
          style={{
            width: 196, flexShrink: 0,
            background: dragOverZone === "available" ? "rgba(255,255,255,0.8)" : TOKENS.paperLight,
            border: `1px dashed ${dragOverZone === "available" ? TOKENS.inkSoft : TOKENS.rule}`,
            borderRadius: 3, padding: 14,
            display: "flex", flexDirection: "column", gap: 6,
            transition: "background 0.12s, border-color 0.12s",
          }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2,
            color: TOKENS.inkFaint, marginBottom: 6, textTransform: "uppercase",
          }}>Available fields</div>

          {availableFields.map(f => (
            <AxisFieldChip
              key={f.id}
              field={f}
              onDragStart={() => setDragFieldId(f.id)}
              onDragEnd={() => { setDragFieldId(null); setDragOverZone(null); }}
            />
          ))}

          {availableFields.length === 0 && (
            <div style={{
              fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
              color: TOKENS.inkFaint, padding: "12px 4px",
            }}>All fields placed. Drag one back here to release it.</div>
          )}

          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
            color: TOKENS.inkFaint, marginTop: 8, lineHeight: 1.4,
          }}>
            Drag a field to Row or Column to pivot your papers.
          </div>
        </div>

        {/* Right: drop zones + pivot */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden", minWidth: 0 }}>
          {/* Drop zones */}
          <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
            <AxisDropZone
              label="Row axis — each row"
              hint="Papers grouped by this field's values form the rows."
              field={rowDef}
              isDragOver={dragOverZone === "row"}
              onDragOver={() => setDragOverZone("row")}
              onDragLeave={() => { if (dragOverZone === "row") setDragOverZone(null); }}
              onDrop={() => handleDrop("row")}
              onRemove={() => setRowFieldId(null)}
            />
            <AxisDropZone
              label="Column axis — each column"
              hint="Papers grouped by this field's values form the columns."
              field={colDef}
              isDragOver={dragOverZone === "col"}
              onDragOver={() => setDragOverZone("col")}
              onDragLeave={() => { if (dragOverZone === "col") setDragOverZone(null); }}
              onDrop={() => handleDrop("col")}
              onRemove={() => setColFieldId(null)}
              highlighted
            />
          </div>

          {/* Live pivot table */}
          <div style={{
            flex: 1, overflow: "auto",
            background: "rgba(255,255,255,0.35)",
            border: `1px solid ${TOKENS.rule}`,
            borderRadius: 2, padding: 16,
          }}>
            <div style={{
              fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2,
              color: TOKENS.inkFaint, marginBottom: 10, textTransform: "uppercase",
            }}>Live pivot</div>

            {(!rowDef || !colDef) ? (
              <div style={{
                padding: "48px 24px", textAlign: "center",
                fontFamily: FONTS.serif, fontSize: 14, fontStyle: "italic",
                color: TOKENS.inkFaint,
              }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 18, color: TOKENS.inkSoft, marginBottom: 8 }}>
                  Drag fields to both zones above
                </div>
                When both a Row axis and a Column axis are set, your {totalPapers} papers
                will be pivoted into a grid here.
              </div>
            ) : (
              <PivotTable
                rowDef={rowDef}
                colDef={colDef}
                onCellClick={(rv, cv, papers) => setCellModal({ rv, cv, papers })}
              />
            )}
          </div>

          {/* Footer */}
          {rowDef && colDef && (
            <div style={{
              flexShrink: 0, display: "flex", gap: 8,
              fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
              color: TOKENS.inkSoft, alignItems: "center",
            }}>
              <span style={{ color: TOKENS.inkFaint }}>Axes:</span>
              <span style={{ color: TOKENS.ink }}>{rowDef.label}</span>
              <span style={{ color: TOKENS.inkFaint }}>×</span>
              <span style={{ color: TOKENS.ink }}>{colDef.label}</span>
              <div style={{ flex: 1 }} />
              <span style={{
                fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint,
              }}>Click any cell to see papers at that intersection</span>
            </div>
          )}
        </div>
      </div>

      {/* Cell detail modal */}
      {cellModal && rowDef && colDef && (
        <CellModal
          rowLabel={rowDef.getLabel(cellModal.rv)}
          colLabel={colDef.getLabel(cellModal.cv)}
          papers={cellModal.papers}
          onClose={() => setCellModal(null)}
          onSelectPaper={openPaperAndClose}
        />
      )}
    </div>
  );
};

window.AxisBuilderScreen = AxisBuilderScreen;
