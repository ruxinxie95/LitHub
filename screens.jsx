// Paper detail screen + AI extraction flow + Axis builder + Visualizations + My Ideas

// === DETAIL SCREEN ===
const DetailField = ({ label, children, hand }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{
      fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
      color: TOKENS.inkFaint, marginBottom: 4,
    }}>{label}</div>
    <div style={{
      fontFamily: hand ? FONTS.hand : FONTS.serif,
      fontSize: hand ? 16 : 13,
      color: hand ? TOKENS.accent : TOKENS.ink,
      lineHeight: 1.5,
    }}>{children}</div>
  </div>
);

const DetailScreen = () => {
  const selectedId = window.useSelected ? window.useSelected() : "p004";
  const p = PAPERS.find((x) => x.id === selectedId) || PAPERS.find((x) => x.id === "p004");
  const userHero = window.useThumbnail ? window.useThumbnail(p.id) : null;
  const starred = window.useStarred ? window.useStarred(p.id) : p.starred;

  // Build a navigable list. Prefer current filtered view if available; else fall back to all papers.
  // Read from the FilterProvider state stashed on window (set below in HubScreen).
  const navList = (window.__currentFiltered && window.__currentFiltered.length)
    ? window.__currentFiltered
    : PAPERS;
  const navIds = navList.map(x => x.id);
  let idx = navIds.indexOf(p.id);
  if (idx === -1) idx = 0;
  const prev = navList[(idx - 1 + navList.length) % navList.length];
  const next = navList[(idx + 1) % navList.length];

  const goPrev = () => window.setSelected && window.setSelected(prev.id);
  const goNext = () => window.setSelected && window.setSelected(next.id);

  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: TOKENS.paper,
      fontFamily: FONTS.serif,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 24px", borderBottom: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperDeep,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.inkSoft }}>
          <span style={{ color: TOKENS.inkFaint }}>Library / All papers /</span>
          <span style={{ color: TOKENS.ink, fontWeight: 500, marginLeft: 4 }}>{p?.title.slice(0, 40)}{p?.title.length > 40 ? '…' : ''}</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint, marginRight: 4 }}>
          {idx + 1} / {navList.length}
        </span>
        <ToolbarButton onClick={goPrev}>← prev</ToolbarButton>
        <ToolbarButton onClick={goNext}>next →</ToolbarButton>
        <ToolbarButton>Open PDF ↗</ToolbarButton>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: hero figure */}
        <div style={{
          width: 420, padding: 24,
          borderRight: `1px solid ${TOKENS.rule}`,
          display: "flex", flexDirection: "column", gap: 16,
          background: TOKENS.paperLight,
        }}>
          <div style={{
            background: TOKENS.paper, padding: 8,
            border: `1px solid ${TOKENS.rule}`,
            boxShadow: "0 1px 3px rgba(20,30,50,0.10)",
          }}>
            <div
              onClick={() => window.openUploadModal(p.id, p.title)}
              title={userHero ? "Click to replace" : "Click to upload graphical abstract"}
              style={{
                aspectRatio: "1 / 1",
                background: TOKENS.paperDeep,
                border: `1px dashed ${TOKENS.rule}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: userHero ? 0 : 20,
                cursor: "pointer",
                overflow: "hidden",
              }}>
              {userHero ? (
                <img src={userHero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <Thumb kind={p.thumb} size={280} />
              )}
            </div>
            <div style={{
              fontFamily: FONTS.serif, fontSize: 10, fontStyle: "italic",
              color: TOKENS.inkSoft, marginTop: 6, textAlign: "center",
            }}>fig. 1 — graphical abstract {!userHero && <span style={{ color: TOKENS.accent }}>· click to upload</span>}</div>
          </div>

          {/* Quick stats */}
          <div style={{
            background: "rgba(255,255,255,0.4)",
            border: `1px solid ${TOKENS.ruleFaint}`,
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint, letterSpacing: 1 }}>YEAR</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: TOKENS.ink }}>{p.year}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint, letterSpacing: 1 }}>VENUE</span>
              <span style={{ fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink, fontStyle: "italic" }}>{p.venue}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint, letterSpacing: 1 }}>CITATIONS</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: TOKENS.ink }}>{p.citations}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint, letterSpacing: 1 }}>SHAPE-CHANGE</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: TOKENS.accent }}>{p.shapeChangeTime}</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 6 }}>STIMULUS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {p.stimulus.map((s) => <StimTag key={s} kind={s} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 6 }}>KEYWORDS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {p.keywords.map((k) => <Tag key={k} color={TOKENS.inkSoft}>{k}</Tag>)}
            </div>
          </div>
        </div>

        {/* Right: extracted fields + my notes */}
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          <div style={{
            fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
            color: TOKENS.inkSoft, marginBottom: 4,
          }}>{p.authors.join(", ")} — <span style={{ color: TOKENS.inkFaint }}>{p.venue}, {p.year}</span></div>
          <h1 style={{
            fontFamily: FONTS.display, fontSize: 28, fontWeight: 500,
            color: TOKENS.ink, lineHeight: 1.2, margin: "4px 0 8px",
            letterSpacing: -0.3,
          }}>{p.title}</h1>
          <div style={{ display: "flex", gap: 4, marginBottom: 18, alignItems: "center" }}>
            <StarToggle paperId={p.id} size={16} />
            {p.is4D && <Tag color={TOKENS.sage}>4D printing</Tag>}
            {p.bistable && <Tag color={TOKENS.accent} bg="rgba(168,71,43,0.06)">bistable</Tag>}
            <Tag color={TOKENS.teal}>hygromorph</Tag>
          </div>

          <RuleLine dashed style={{ marginBottom: 18 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <DetailField label="Fabrication">{p.fabrication}</DetailField>
            <DetailField label="Stimulus">{p.stimulus.map((s) => <StimTag key={s} kind={s} />)}</DetailField>
            <DetailField label="Active material">{p.activeMaterial}</DetailField>
            <DetailField label="Passive material">
              <span style={{ color: TOKENS.inkFaint, fontStyle: "italic" }}>{p.passiveMaterial === '—' ? 'not specified' : p.passiveMaterial}</span>
            </DetailField>
            <DetailField label="Shape-change time">
              <span style={{ fontFamily: FONTS.mono, color: TOKENS.accent }}>{p.shapeChangeTime}</span>
            </DetailField>
            <DetailField label="Geometry">
              <Tag color={TOKENS.teal}>{p.bistable ? 'bistable shell' : p.miura ? 'origami' : 'shape-morphing'}</Tag>
            </DetailField>
          </div>

          <DetailField label="Abstract (auto-extracted from .bib)">
            <span style={{ fontFamily: FONTS.serif, fontSize: 12.5, lineHeight: 1.55, color: TOKENS.inkSoft }}>
              {p.abstract ? p.abstract.slice(0, 480) + (p.abstract.length > 480 ? '…' : '') : 'No abstract on file.'}
            </span>
          </DetailField>

          <RuleLine dashed style={{ margin: "8px 0 16px" }} />

          {/* My notes — annotation zone */}
          <div style={{
            background: TOKENS.highlight + "55",
            border: `1px solid ${TOKENS.accent}`,
            padding: "14px 18px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: -8, left: 14,
              background: TOKENS.paperLight, padding: "0 8px",
              fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2,
              color: TOKENS.accent, textTransform: "uppercase",
            }}>my notes</div>
            <div style={{
              fontFamily: FONTS.hand, fontSize: 17, color: TOKENS.ink,
              lineHeight: 1.5,
            }}>
              Bistable + hygromorph in one paper — this is the closest existing
              precedent to my <span style={{ color: TOKENS.accent, borderBottom: `1.5px solid ${TOKENS.accent}` }}>bistable hygromorph</span>
              hybrid idea. Architectural-scale targets too.
              <br /><br />
              Compare to Gladman 2016 (smooth bilayer hygromorph) and Esser 2020 (artificial Venus flytrap survey).
              <br />
              <span style={{ fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic", color: TOKENS.inkSoft }}>
                — linked to idea: "Bistable hygromorph hybrid"
              </span>
            </div>
          </div>

          <div style={{
            marginTop: 16, display: "flex", gap: 8,
          }}>
            <ToolbarButton accent>+ Link to idea</ToolbarButton>
            <ToolbarButton>+ Compare with…</ToolbarButton>
            <ToolbarButton>Export citation</ToolbarButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// === AI EXTRACTION FLOW ===
const ExtractionScreen = () => {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: TOKENS.paper,
      fontFamily: FONTS.serif,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "14px 24px", borderBottom: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperDeep,
      }}>
        <div style={{ fontFamily: FONTS.hand, fontSize: 22, color: TOKENS.accent }}>
          Extracting fields…
        </div>
        <div style={{ fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic", color: TOKENS.inkSoft }}>
          Folio is reading 4 PDFs and suggesting field values. Review &amp; accept below.
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: PDF preview */}
        <div style={{
          width: 380, borderRight: `1px solid ${TOKENS.rule}`,
          padding: 20, background: TOKENS.paperLight,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint }}>NOW READING — 2 of 4</div>
          <div style={{
            background: "white", padding: 14,
            border: `1px solid ${TOKENS.rule}`,
            boxShadow: "0 2px 6px rgba(20,30,50,0.10)",
            flex: 1,
          }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: 11, fontWeight: 600,
              color: TOKENS.ink, lineHeight: 1.3, marginBottom: 4,
            }}>Biomimetic 4D printing</div>
            <div style={{ fontFamily: FONTS.serif, fontSize: 8, color: TOKENS.inkFaint, marginBottom: 8 }}>
              A. Sydney Gladman et al. · Nature Materials · 2016
            </div>
            <div style={{
              fontFamily: FONTS.serif, fontSize: 7, color: TOKENS.ink,
              lineHeight: 1.5, columnCount: 1, textAlign: "justify",
            }}>
              <span style={{ background: TOKENS.highlight }}>Shape-morphing systems can be found in many areas, including smart textiles, autonomous robotics</span>, biomedical devices, drug delivery and tissue engineering. The natural analogues of such systems are exemplified by nastic plant motions, where a variety of organs such as tendrils, bracts, leaves and flowers respond to environmental stimuli (such as humidity, light or touch) by varying internal turgor…
              <br /><br />
              Here, we demonstrate <span style={{ background: TOKENS.accent + "33" }}>biomimetic 4D printing through a direct-write process</span> in which <span style={{ background: TOKENS.highlight }}>cellulose fibrils are aligned during printing</span> to encode local anisotropic stiffness and swelling…
            </div>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint,
          }}>
            <span>p. 1 of 6</span>
            <span style={{ color: TOKENS.accent }}>● scanning fig. 2…</span>
          </div>
        </div>

        {/* Right: extracted fields with confidence */}
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          <div style={{
            fontFamily: FONTS.display, fontSize: 18, fontWeight: 500,
            color: TOKENS.ink, marginBottom: 4,
          }}>Suggested fields</div>
          <div style={{
            fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
            color: TOKENS.inkSoft, marginBottom: 20,
          }}>Click ✓ to accept, ✎ to edit, ✕ to skip. Folio learns from your edits.</div>

          {[
            { label: "Title", value: "Biomimetic 4D printing", conf: 100, status: "accepted" },
            { label: "Authors", value: "A. Sydney Gladman, Elisabetta Matsumoto, Ralph Nuzzo, L. Mahadevan, Jennifer Lewis", conf: 98, status: "accepted" },
            { label: "Year", value: "2016", conf: 100, status: "accepted" },
            { label: "Venue", value: "Nature Materials, vol. 15", conf: 99, status: "accepted" },
            { label: "Is 4D printing?", value: "Yes", conf: 99, status: "accepted" },
            { label: "Fabrication method", value: "Direct ink writing (DIW) — bilayer", conf: 94, status: "review" },
            { label: "Active material", value: "Cellulose fibril hydrogel", conf: 96, status: "review" },
            { label: "Passive material", value: "PDMS substrate", conf: 78, status: "review", warn: "low confidence" },
            { label: "Stimulus", value: "water, humidity", conf: 92, status: "review" },
            { label: "Shape-change time", value: "~30 min", conf: 71, status: "review", warn: "estimate from fig. 4 caption" },
            { label: "Objectives", value: "Encode anisotropic swelling via fiber alignment to program complex curvatures.", conf: 88, status: "review" },
            { label: "Future potential", value: "Programmable morphing structures for soft robotics, tissue scaffolds, responsive textiles.", conf: 75, status: "review" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "120px 1fr 70px 100px",
              gap: 14, padding: "10px 0",
              borderBottom: `1px dashed ${TOKENS.ruleFaint}`,
              alignItems: "center",
            }}>
              <div style={{
                fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
                color: TOKENS.inkFaint,
              }}>{f.label}</div>
              <div>
                <div style={{ fontFamily: FONTS.serif, fontSize: 13, color: TOKENS.ink }}>{f.value}</div>
                {f.warn && (
                  <div style={{
                    fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
                    color: TOKENS.ochre, marginTop: 2,
                  }}>⚠ {f.warn}</div>
                )}
              </div>
              {/* Confidence bar */}
              <div>
                <div style={{
                  height: 4, background: TOKENS.ruleFaint, position: "relative",
                  marginBottom: 2,
                }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, height: "100%",
                    width: `${f.conf}%`,
                    background: f.conf > 90 ? TOKENS.sage : f.conf > 80 ? TOKENS.ochre : TOKENS.accent,
                  }} />
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint }}>
                  {f.conf}% conf.
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <ActionBtn icon="✓" color={f.status === "accepted" ? TOKENS.sage : TOKENS.inkFaint} filled={f.status === "accepted"} />
                <ActionBtn icon="✎" color={TOKENS.ochre} />
                <ActionBtn icon="✕" color={TOKENS.inkFaint} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
            <ToolbarButton accent>Accept all &amp; continue →</ToolbarButton>
            <ToolbarButton>Skip this paper</ToolbarButton>
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic", color: TOKENS.inkSoft,
            }}>
              <span style={{ fontFamily: FONTS.mono, color: TOKENS.sage }}>●●</span>○○ — 2 of 4 done
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, color, filled }) => (
  <button style={{
    width: 22, height: 22,
    border: `1px solid ${color}`,
    background: filled ? color : "transparent",
    color: filled ? TOKENS.paperLight : color,
    fontSize: 11, lineHeight: 1, fontFamily: FONTS.mono,
    cursor: "pointer", padding: 0,
  }}>{icon}</button>
);

// === AXIS BUILDER ===
const AxisBuilderScreen = () => {
  const fields = [
    { id: "year", label: "Year", icon: "📅", picked: false },
    { id: "title", label: "Title", icon: "T", picked: true, axis: "row" },
    { id: "authors", label: "Authors", icon: "A", picked: true, axis: "row" },
    { id: "thumb", label: "Thumbnail", icon: "▢", picked: true, axis: "row" },
    { id: "active", label: "Active material", icon: "◉", picked: true, axis: "col" },
    { id: "passive", label: "Passive material", icon: "○" },
    { id: "fab", label: "Fabrication", icon: "✦" },
    { id: "stim", label: "Stimulus", icon: "✿" },
    { id: "time", label: "Shape-change time", icon: "⌚" },
    { id: "obj", label: "Objectives", icon: "◎" },
    { id: "future", label: "Future potential", icon: "✎" },
    { id: "is4d", label: "Is 4D printing?", icon: "4D" },
    { id: "keywords", label: "Keywords", icon: "#" },
  ];

  return (
    <div style={{
      width: "100%", height: "100%",
      background: TOKENS.paper,
      fontFamily: FONTS.serif,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 32px", borderBottom: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperDeep,
      }}>
        <div style={{
          fontFamily: FONTS.hand, fontSize: 28, color: TOKENS.accent, lineHeight: 1,
        }}>Configure your matrix</div>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 13, fontStyle: "italic",
          color: TOKENS.inkSoft, marginTop: 4,
        }}>What goes on the rows? What goes on the columns? Drag fields below.</div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: 32, gap: 24 }}>
        {/* Field palette */}
        <div style={{
          width: 240,
          background: TOKENS.paperLight,
          border: `1px dashed ${TOKENS.rule}`,
          padding: 16, display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint,
            marginBottom: 8, textTransform: "uppercase",
          }}>Available fields</div>
          {fields.filter(f => !f.picked).map((f) => (
            <FieldChip key={f.id} {...f} />
          ))}
          <div style={{ flex: 1 }} />
          <button style={{
            fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.accent,
            background: "transparent", border: `1px dashed ${TOKENS.accent}`,
            padding: "6px 10px", cursor: "pointer", marginTop: 8,
          }}>+ New custom field</button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Rows zone */}
          <DropZone
            label="ROWS — what each row represents"
            hint="Each row = one paper. Pick the fields you want visible per paper."
          >
            {fields.filter((f) => f.axis === "row").map((f) => <FieldChip key={f.id} {...f} placed />)}
            <DropTarget>+ drop here</DropTarget>
          </DropZone>

          {/* Columns zone */}
          <DropZone
            label="COLUMNS — comparison axes"
            hint="Pick fields to grid by. Drag from below."
            highlighted
          >
            {fields.filter((f) => f.axis === "col").map((f) => <FieldChip key={f.id} {...f} placed />)}
            <FieldChip id="stim" label="Stimulus" icon="✿" placed dashed />
            <DropTarget>+ drop here</DropTarget>
          </DropZone>

          {/* Preview */}
          <div style={{
            flex: 1,
            background: "rgba(255,255,255,0.4)",
            border: `1px solid ${TOKENS.rule}`,
            padding: 16, display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 8 }}>PREVIEW</div>
            <PreviewMatrix />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <ToolbarButton>Reset</ToolbarButton>
            <ToolbarButton>Save as preset…</ToolbarButton>
            <ToolbarButton accent>Apply →</ToolbarButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldChip = ({ label, icon, placed, dashed }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 10px",
    background: placed ? "rgba(168,71,43,0.10)" : "rgba(255,255,255,0.5)",
    border: `1px ${dashed ? "dashed" : "solid"} ${placed ? TOKENS.accent : TOKENS.rule}`,
    borderRadius: 2,
    fontFamily: FONTS.serif, fontSize: 12,
    color: placed ? TOKENS.accent : TOKENS.ink,
    cursor: "grab",
    boxShadow: placed ? "1px 1px 0 rgba(168,71,43,0.20)" : "none",
    marginRight: 6, marginBottom: 6,
    width: "fit-content",
  }}>
    <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint }}>{icon}</span>
    {label}
    {placed && <span style={{ marginLeft: 4, color: TOKENS.inkFaint, fontSize: 10 }}>×</span>}
  </div>
);

const DropZone = ({ label, hint, children, highlighted }) => (
  <div style={{
    background: highlighted ? TOKENS.highlight + "55" : "rgba(255,255,255,0.3)",
    border: `2px dashed ${highlighted ? TOKENS.accent : TOKENS.rule}`,
    padding: "12px 16px", minHeight: 70,
  }}>
    <div style={{
      fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2,
      color: highlighted ? TOKENS.accent : TOKENS.inkFaint, marginBottom: 4,
    }}>{label}</div>
    <div style={{
      fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
      color: TOKENS.inkSoft, marginBottom: 8,
    }}>{hint}</div>
    <div style={{ display: "flex", flexWrap: "wrap" }}>{children}</div>
  </div>
);

const DropTarget = ({ children }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "5px 12px",
    border: `1px dashed ${TOKENS.inkFaint}`,
    fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
    color: TOKENS.inkFaint, marginBottom: 6,
  }}>{children}</div>
);

const PreviewMatrix = () => (
  <div style={{ flex: 1, overflow: "hidden" }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "120px repeat(4, 1fr)",
      gridTemplateRows: "auto repeat(3, 1fr)",
      gap: 1, background: TOKENS.rule, height: "100%",
      fontSize: 10,
    }}>
      <div style={{ background: TOKENS.paperDeep, padding: 6, fontFamily: FONTS.mono, fontSize: 8, color: TOKENS.inkFaint }}></div>
      {["Hydrogel", "SMP", "LCE", "Wood/PLA"].map((m) => (
        <div key={m} style={{ background: TOKENS.paperDeep, padding: 6, fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.ink, textAlign: "center" }}>{m}</div>
      ))}
      {[
        ['Gladman \'16', 'flower', null, null, null],
        ['Wood \'15', 'vertical', null, null, null],
        ['Boley \'24', null, 'shell', null, null],
      ].map((row, i) => (
        <React.Fragment key={i}>
          <div style={{ background: TOKENS.paperLight, padding: 6, fontFamily: FONTS.serif, fontSize: 10, color: TOKENS.ink, fontStyle: "italic" }}>{row[0]}</div>
          {row.slice(1).map((cell, j) => (
            <div key={j} style={{
              background: TOKENS.paper, padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cell && <Thumb kind={cell} size={28} />}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// === VISUALIZATIONS SCREEN ===
const VizScreen = () => (
  <div style={{
    width: "100%", height: "100%",
    background: TOKENS.paper,
    fontFamily: FONTS.serif,
    overflow: "hidden",
    display: "flex", flexDirection: "column",
  }}>
    <TopBar />
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 28, overflow: "auto", background: TOKENS.paper }}>
        <div style={{ fontFamily: FONTS.hand, fontSize: 26, color: TOKENS.accent, marginBottom: 4 }}>
          The shape of the field
        </div>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
          color: TOKENS.inkSoft, marginBottom: 20,
        }}>66 papers · 2005–2026 · click any cell to filter the matrix</div>

        {/* Heatmap */}
        <VizCard title="Material × Method" subtitle="Heatmap — where the field has gathered, and where it hasn't">
          <Heatmap />
        </VizCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <VizCard title="Shape-change time" subtitle="distribution — illustrative; few abstracts report explicit times">
            <TimeDistribution />
          </VizCard>
          <VizCard title="Research-gap map" subtitle="combinations rare or missing in literature">
            <GapMap />
          </VizCard>
        </div>
      </div>
    </div>
  </div>
);

const VizCard = ({ title, subtitle, children }) => (
  <div style={{
    background: TOKENS.paperLight,
    border: `1px solid ${TOKENS.rule}`,
    padding: 20,
    boxShadow: "1px 2px 0 rgba(60,40,20,0.06)",
    marginBottom: 16,
  }}>
    <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 500, color: TOKENS.ink }}>{title}</div>
    <div style={{
      fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
      color: TOKENS.inkSoft, marginBottom: 14,
    }}>{subtitle}</div>
    {children}
  </div>
);

const Heatmap = () => {
  const methods = ["FDM", "DIW", "PolyJet", "DLP/SLA", "Multi-step"];
  const materials = ["SMP", "Hydrogel", "LCE", "Cellulose/Wood", "Magnetic", "Pre-strained PLA"];
  // Fake but plausible counts
  const data = [
    [18, 4, 2, 0, 1, 22],     // FDM
    [3, 19, 1, 0, 6, 0],      // DIW
    [22, 5, 4, 0, 2, 0],      // PolyJet
    [4, 2, 11, 0, 0, 0],      // DLP/SLA
    [3, 0, 0, 7, 1, 1],       // Multi-step
  ];
  const max = 22;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px repeat(6, 1fr)", gap: 2 }}>
      <div></div>
      {materials.map((m) => (
        <div key={m} style={{
          fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkSoft,
          padding: "4px 6px", textAlign: "center",
          writingMode: "horizontal-tb",
        }}>{m}</div>
      ))}
      {methods.map((method, i) => (
        <React.Fragment key={method}>
          <div style={{
            fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink,
            padding: "8px 0", textAlign: "right", paddingRight: 10,
            fontStyle: "italic",
          }}>{method}</div>
          {data[i].map((v, j) => {
            const intensity = v / max;
            const isGap = v === 0;
            return (
              <div key={j} style={{
                aspectRatio: "1.6 / 1", minHeight: 44,
                background: isGap
                  ? "rgba(255,255,255,0.3)"
                  : `rgba(168, 71, 43, ${0.10 + intensity * 0.75})`,
                border: isGap ? `1px dashed ${TOKENS.accent}` : `1px solid ${TOKENS.ruleFaint}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONTS.mono, fontSize: 13,
                color: intensity > 0.5 ? TOKENS.paperLight : isGap ? TOKENS.accent : TOKENS.ink,
                fontWeight: 500,
                position: "relative",
              }}>
                {isGap ? <span style={{ fontFamily: FONTS.hand, fontSize: 16 }}>gap?</span> : v}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

const TimeDistribution = () => {
  const buckets = [
    { label: "<1s", count: 18, color: TOKENS.teal },
    { label: "1–60s", count: 24, color: TOKENS.teal },
    { label: "1–10min", count: 41, color: TOKENS.ochre },
    { label: "10–60min", count: 38, color: TOKENS.ochre },
    { label: "1–24h", count: 19, color: TOKENS.accent },
    { label: ">24h", count: 7, color: TOKENS.accent },
  ];
  const max = Math.max(...buckets.map((b) => b.count));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 220 }}>
        {buckets.map((b) => (
          <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: TOKENS.ink }}>{b.count}</div>
            <div style={{
              width: "70%", height: `${(b.count / max) * 180}px`,
              background: b.color, opacity: 0.7,
              border: `1px solid ${b.color}`,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {buckets.map((b) => (
          <div key={b.label} style={{
            flex: 1, textAlign: "center",
            fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkSoft,
          }}>{b.label}</div>
        ))}
      </div>
      <div style={{
        marginTop: 12, padding: 10,
        background: TOKENS.accent + "10", border: `1px dashed ${TOKENS.accent}`,
        fontFamily: FONTS.hand, fontSize: 14, color: TOKENS.accent,
      }}>
        ↳ peak at 10–60min — mostly hydrogels &amp; SMPs. Sub-second realm = magnetic only.
      </div>
    </div>
  );
};

const GapMap = () => (
  <div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { combo: "Bistable + Hygromorph", count: 1, opportunity: 92 },
        { combo: "Origami + LCE", count: 0, opportunity: 88 },
        { combo: "pH + Multistable", count: 1, opportunity: 78 },
        { combo: "Magnetic + Cellulose", count: 0, opportunity: 71 },
        { combo: "Light + Bistable shell", count: 0, opportunity: 90 },
      ].map((g) => (
        <div key={g.combo} style={{
          display: "grid", gridTemplateColumns: "1fr 60px 100px",
          gap: 12, alignItems: "center",
          padding: "8px 10px",
          background: g.opportunity > 85 ? TOKENS.highlight + "66" : "rgba(255,255,255,0.4)",
          border: `1px solid ${g.opportunity > 85 ? TOKENS.accent : TOKENS.ruleFaint}`,
        }}>
          <div style={{ fontFamily: FONTS.serif, fontSize: 12.5, color: TOKENS.ink }}>{g.combo}</div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 11,
            color: g.count === 0 ? TOKENS.accent : TOKENS.inkSoft,
            textAlign: "center",
          }}>{g.count} papers</div>
          <div>
            <div style={{ height: 4, background: TOKENS.ruleFaint, position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${g.opportunity}%`, background: TOKENS.accent,
              }} />
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.inkFaint, marginTop: 2 }}>
              {g.opportunity}% opportunity
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{
      marginTop: 14, fontFamily: FONTS.hand, fontSize: 14,
      color: TOKENS.accent, padding: "0 4px",
    }}>
      ↳ "Bistable + Hygromorph" → maybe your bistable Miura idea?
    </div>
  </div>
);

// === MY IDEAS PANEL ===
const IdeasScreen = () => (
  <div style={{
    width: "100%", height: "100%",
    background: TOKENS.paper,
    fontFamily: FONTS.serif,
    overflow: "hidden",
    display: "flex", flexDirection: "column",
  }}>
    <div style={{
      padding: "20px 32px", borderBottom: `1px solid ${TOKENS.rule}`,
      background: TOKENS.paperDeep,
    }}>
      <div style={{ fontFamily: FONTS.hand, fontSize: 30, color: TOKENS.accent, lineHeight: 1 }}>
        My ideas
      </div>
      <div style={{ fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic", color: TOKENS.inkSoft, marginTop: 4 }}>
        Working hypotheses, with the papers that support and inform each one.
      </div>
    </div>
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Idea list */}
      <div style={{
        width: 260, borderRight: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperLight, padding: "16px 14px",
      }}>
        <IdeaListItem title="Bistable hygromorph hybrid" papers={6} active />
        <IdeaListItem title="Cellulose + SME bilayer" papers={3} />
        <IdeaListItem title="Hygromorphic facade unit" papers={4} />
        <IdeaListItem title="Plant-inspired snap actuators" papers={5} />
        <button style={{
          marginTop: 12,
          fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.accent,
          background: "transparent", border: `1px dashed ${TOKENS.accent}`,
          padding: "6px 10px", cursor: "pointer", width: "100%",
        }}>+ New idea</button>
      </div>

      {/* Idea detail */}
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint }}>IDEA · DRAFT</div>
        <h2 style={{
          fontFamily: FONTS.display, fontSize: 26, fontWeight: 500,
          color: TOKENS.ink, margin: "4px 0 14px",
        }}>Bistable hygromorph hybrid</h2>
        <div style={{
          background: TOKENS.highlight + "55", border: `1px solid ${TOKENS.accent}`,
          padding: "14px 18px", marginBottom: 24,
          fontFamily: FONTS.hand, fontSize: 16, color: TOKENS.ink, lineHeight: 1.5,
        }}>
          What if hygromorphic bilayers were printed onto bistable shell geometries?
          Slow humidity-driven loading + snap-through release = fast, autonomous actuators
          that mimic the Venus flytrap. Architectural facades that breathe — but with discrete states.
          <br /><br />
          Combine plant-inspired snap mechanisms with 3D-printed wood composites.
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          marginBottom: 24,
        }}>
          <StatTile label="supporting papers" value="6" />
          <StatTile label="related gaps" value="3" />
          <StatTile label="readiness" value="early" hand />
        </div>

        <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 8 }}>
          LINKED PAPERS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { p: PAPERS.find(x => x.id === "p004"), role: "foundation" },
            { p: PAPERS.find(x => x.id === "p011"), role: "foundation" },
            { p: PAPERS.find(x => x.id === "p024"), role: "inspiration" },
            { p: PAPERS.find(x => x.id === "p018"), role: "inspiration" },
            { p: PAPERS.find(x => x.id === "p008"), role: "method" },
            { p: PAPERS.find(x => x.id === "p010"), role: "related" },
          ].map(({ p, role }) => (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "50px 1fr 90px 80px",
              gap: 12, alignItems: "center",
              padding: "8px 10px",
              background: "rgba(255,255,255,0.5)",
              border: `1px solid ${TOKENS.ruleFaint}`,
            }}>
              <div style={{ width: 44, height: 44, border: `1px solid ${TOKENS.rule}`, padding: 1, background: TOKENS.paperLight }}>
                <Thumb kind={p.thumb} size={40} />
              </div>
              <div>
                <div style={{ fontFamily: FONTS.display, fontSize: 12, fontWeight: 500, color: TOKENS.ink, lineHeight: 1.3 }}>
                  {p.title}
                </div>
                <div style={{ fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic", color: TOKENS.inkSoft }}>
                  {p.authors[0]} · {p.year}
                </div>
              </div>
              <Tag color={
                role === "foundation" ? TOKENS.accent :
                role === "method" ? TOKENS.teal :
                role === "related" ? TOKENS.ochre : TOKENS.sage
              }>{role}</Tag>
              <span style={{ fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic", color: TOKENS.accent, cursor: "pointer", textAlign: "right" }}>
                open →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const IdeaListItem = ({ title, papers, active }) => (
  <div style={{
    padding: "10px 12px", marginBottom: 4,
    background: active ? "rgba(168,71,43,0.10)" : "transparent",
    borderLeft: active ? `2px solid ${TOKENS.accent}` : "2px solid transparent",
  }}>
    <div style={{ fontFamily: FONTS.serif, fontSize: 13, color: active ? TOKENS.accent : TOKENS.ink, fontWeight: active ? 500 : 400 }}>
      {title}
    </div>
    <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: TOKENS.inkFaint, marginTop: 2 }}>
      {papers} papers linked
    </div>
  </div>
);

const StatTile = ({ label, value, hand }) => (
  <div style={{
    padding: "12px 14px",
    background: "rgba(255,255,255,0.5)",
    border: `1px solid ${TOKENS.ruleFaint}`,
  }}>
    <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, textTransform: "uppercase" }}>{label}</div>
    <div style={{
      fontFamily: hand ? FONTS.hand : FONTS.display,
      fontSize: hand ? 22 : 24,
      color: hand ? TOKENS.accent : TOKENS.ink, marginTop: 4,
    }}>{value}</div>
  </div>
);

window.DetailScreen = DetailScreen;
window.ExtractionScreen = ExtractionScreen;
window.AxisBuilderScreen = AxisBuilderScreen;
window.VizScreen = VizScreen;
window.IdeasScreen = IdeasScreen;
