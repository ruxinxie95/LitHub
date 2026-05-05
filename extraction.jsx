// Functional AI extraction screen
// Paste abstract / BibTeX / full text → Claude extracts structured fields →
// edit each field → save to library (localStorage + live PAPERS array).
//
// Requires a Claude API key (stored in localStorage). The API is called
// directly from the browser using the Anthropic REST endpoint with the
// anthropic-dangerous-request-header flag.
//
// NOTE: direct-browser API calls only work when served over HTTP/HTTPS.
// If you open index.html via file://, requests may be blocked by CORS.
// Serve with: python -m http.server 8080  then open http://localhost:8080

const EXTR_API_KEY  = "folio_apikey_v1";
const USER_PAPERS_K = "folio_user_papers_v1";

// ── Load user-added papers into PAPERS on startup ────────────────────────────
// This runs once when the module loads, before React renders.
;(function mergeUserPapers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USER_PAPERS_K) || "[]");
    if (!Array.isArray(stored) || stored.length === 0) return;
    const existingIds = new Set((window.PAPERS || []).map(p => p.id));
    stored.forEach(p => { if (!existingIds.has(p.id)) window.PAPERS.push(p); });
  } catch (_) {}
})();

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadApiKey() {
  try { return localStorage.getItem(EXTR_API_KEY) || ""; } catch { return ""; }
}

function saveApiKey(k) {
  try { localStorage.setItem(EXTR_API_KEY, k || ""); } catch {}
}

function saveUserPaper(paper) {
  try {
    const stored = JSON.parse(localStorage.getItem(USER_PAPERS_K) || "[]");
    stored.push(paper);
    localStorage.setItem(USER_PAPERS_K, JSON.stringify(stored));
  } catch {}
}

// Call Claude claude-sonnet-4-6 to extract paper fields from freeform text.
async function callClaude(apiKey, inputText) {
  const prompt = `Extract structured metadata from this research paper text. Return ONLY a valid JSON object — no explanation, no markdown fences.

Text:
"""
${inputText.trim()}
"""

Return a JSON object with EXACTLY these fields:
{
  "title": string,
  "authors": array of author strings,
  "year": number or null,
  "venue": string,
  "doi": string,
  "abstract": string,
  "is4D": boolean,
  "bistable": boolean,
  "miura": boolean,
  "fabrication": string,
  "activeMaterial": string,
  "passiveMaterial": string,
  "stimulus": array of strings (only from: humidity, water, heat, light, mechanical, magnetic, pH, electric),
  "shapeChangeTime": string,
  "objectives": string,
  "futurePotential": string,
  "keywords": array of strings
}

STRICT RULES — no exceptions:
- Only extract what is explicitly stated in the text.
- If a field is absent from the text, use "" for strings, [] for arrays, false for booleans, null for year.
- shapeChangeTime must be a quoted string like "30 min" or "—" if not stated.
- is4D = true ONLY if the text explicitly says "4D printing" or "4D-printing".
- Return ONLY the JSON object. Nothing else.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-request-header": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    let msg = `API error ${resp.status}`;
    try { const e = await resp.json(); msg = e.error?.message || msg; } catch {}
    throw new Error(msg);
  }

  const data = await resp.json();
  const raw = (data.content?.[0]?.text || "").trim();
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const obj = JSON.parse(cleaned);
  return obj;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ApiKeyBanner = ({ apiKey, onEdit }) => (
  <div style={{
    padding: "10px 24px",
    background: apiKey
      ? `rgba(63,140,122,0.08)`
      : "rgba(196,141,49,0.10)",
    borderBottom: `1px solid ${apiKey ? TOKENS.sage : TOKENS.ochre}`,
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: FONTS.serif, fontSize: 12,
  }}>
    <span style={{ color: apiKey ? TOKENS.sage : TOKENS.ochre, fontSize: 14 }}>
      {apiKey ? "●" : "○"}
    </span>
    <span style={{ color: apiKey ? TOKENS.ink : TOKENS.ochre, flex: 1 }}>
      {apiKey
        ? <React.Fragment>Claude API key set — ready to extract. <span style={{ fontFamily: FONTS.mono, color: TOKENS.inkFaint }}>••••••{apiKey.slice(-4)}</span></React.Fragment>
        : "No Claude API key — add one to enable extraction."}
    </span>
    <button onClick={onEdit} style={{
      fontFamily: FONTS.serif, fontSize: 11,
      color: TOKENS.ink, background: "transparent",
      border: `1px solid ${TOKENS.rule}`, borderRadius: 2, padding: "3px 10px",
      cursor: "pointer",
    }}>{apiKey ? "Change" : "Add API key"}</button>
  </div>
);

const ApiKeyEditor = ({ apiKey, onSave, onCancel }) => {
  const [val, setVal] = React.useState(apiKey);
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current && ref.current.focus(); }, []);
  return (
    <div style={{
      padding: "14px 24px",
      background: TOKENS.paperDeep,
      borderBottom: `1px solid ${TOKENS.rule}`,
    }}>
      <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 6, textTransform: "uppercase" }}>
        Claude API key
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          ref={ref}
          type="password"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(val);
            if (e.key === "Escape") onCancel();
          }}
          placeholder="sk-ant-api03-…"
          style={{
            flex: 1, maxWidth: 480,
            fontFamily: FONTS.mono, fontSize: 13,
            padding: "8px 12px",
            background: "white",
            border: `1px solid ${TOKENS.rule}`, borderRadius: 2,
            color: TOKENS.ink, outline: "none",
          }}
        />
        <button onClick={() => onSave(val)} style={{
          fontFamily: FONTS.serif, fontSize: 13, fontWeight: 500,
          padding: "8px 18px",
          background: val.trim() ? TOKENS.accent : "rgba(31,95,181,0.3)",
          color: TOKENS.paperLight, border: "none", borderRadius: 2,
          cursor: val.trim() ? "pointer" : "default",
        }}>Save</button>
        <button onClick={onCancel} style={{
          fontFamily: FONTS.serif, fontSize: 12,
          color: TOKENS.inkSoft, background: "transparent",
          border: `1px solid ${TOKENS.rule}`, borderRadius: 2, padding: "7px 14px",
          cursor: "pointer",
        }}>Cancel</button>
      </div>
      <div style={{
        fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
        color: TOKENS.inkFaint, marginTop: 6, lineHeight: 1.4,
      }}>
        Your key is stored only in this browser's localStorage and never sent anywhere except the Anthropic API.
        Get a key at <span style={{ fontFamily: FONTS.mono, color: TOKENS.ink }}>console.anthropic.com</span>.
      </div>
    </div>
  );
};

// Editable field row in the results panel
const ExtractedField = ({ label, value, onChange }) => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const isArr = Array.isArray(value);
  const isBool = typeof value === "boolean";
  const displayVal = isBool ? (value ? "Yes" : "No") : isArr ? value.join(", ") : (value ?? "");

  const startEdit = () => {
    if (isBool) { onChange(!value); return; }
    setDraft(isArr ? value.join(", ") : (value ?? ""));
    setEditing(true);
  };

  const commitEdit = () => {
    if (isArr) onChange(draft.split(",").map(s => s.trim()).filter(Boolean));
    else onChange(draft);
    setEditing(false);
  };

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "130px 1fr 60px",
      gap: 12, padding: "9px 0",
      borderBottom: `1px dashed ${TOKENS.ruleFaint}`,
      alignItems: "flex-start",
    }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase",
        color: TOKENS.inkFaint, paddingTop: 3,
      }}>{label}</div>
      <div>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
            style={{
              width: "100%", fontFamily: FONTS.serif, fontSize: 13,
              padding: "3px 6px",
              background: "rgba(255,255,255,0.8)",
              border: `1px solid ${TOKENS.accent}`, borderRadius: 2,
              color: TOKENS.ink, outline: "none",
            }}
          />
        ) : (
          <div style={{
            fontFamily: label === "doi" ? FONTS.mono : FONTS.serif,
            fontSize: 13, color: displayVal ? TOKENS.ink : TOKENS.inkFaint,
            fontStyle: displayVal ? "normal" : "italic", lineHeight: 1.4,
          }}>
            {isBool
              ? <span style={{ color: value ? TOKENS.sage : TOKENS.inkFaint }}>{displayVal}</span>
              : (displayVal || "— not found in text")}
          </div>
        )}
      </div>
      <button
        onClick={startEdit}
        style={{
          fontFamily: FONTS.mono, fontSize: 11,
          color: isBool ? (value ? TOKENS.sage : TOKENS.inkFaint) : TOKENS.ochre,
          background: "transparent",
          border: `1px solid ${isBool ? (value ? TOKENS.sage : TOKENS.rule) : TOKENS.ochre}`,
          borderRadius: 2, padding: "2px 8px",
          cursor: "pointer", alignSelf: "flex-start",
        }}>
        {isBool ? (value ? "✓" : "○") : "✎"}
      </button>
    </div>
  );
};

const ExtractionResults = ({ fields, onChange, onSave, onExtractAnother, saved }) => {
  const update = (key) => (v) => onChange({ ...fields, [key]: v });

  const FIELD_DEFS = [
    { key: "title",            label: "Title" },
    { key: "authors",          label: "Authors" },
    { key: "year",             label: "Year" },
    { key: "venue",            label: "Venue" },
    { key: "doi",              label: "DOI" },
    { key: "is4D",             label: "4D printing?" },
    { key: "bistable",         label: "Bistable?" },
    { key: "miura",            label: "Origami/Miura?" },
    { key: "fabrication",      label: "Fabrication" },
    { key: "activeMaterial",   label: "Active material" },
    { key: "passiveMaterial",  label: "Passive material" },
    { key: "stimulus",         label: "Stimulus" },
    { key: "shapeChangeTime",  label: "Shape-change time" },
    { key: "objectives",       label: "Objectives" },
    { key: "futurePotential",  label: "Future potential" },
    { key: "keywords",         label: "Keywords" },
  ];

  if (saved) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{
          fontFamily: FONTS.display, fontSize: 22, color: TOKENS.sage, marginBottom: 10,
        }}>✓ Saved to library</div>
        <div style={{
          fontFamily: FONTS.serif, fontSize: 13, fontStyle: "italic",
          color: TOKENS.inkSoft, marginBottom: 28,
        }}>
          The paper has been added to your matrix. Switch to the Hub to see it.
        </div>
        <button onClick={onExtractAnother} style={{
          fontFamily: FONTS.serif, fontSize: 13,
          color: TOKENS.accent, background: "transparent",
          border: `1px solid ${TOKENS.accent}`, borderRadius: 2,
          padding: "9px 22px", cursor: "pointer",
        }}>Extract another →</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontFamily: FONTS.display, fontSize: 17, fontWeight: 600,
        color: TOKENS.ink, marginBottom: 4,
      }}>Extracted fields</div>
      <div style={{
        fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
        color: TOKENS.inkSoft, marginBottom: 16,
      }}>
        Click ✎ to edit any field before saving. Booleans toggle on click.
      </div>

      {FIELD_DEFS.map(def => (
        <ExtractedField
          key={def.key}
          label={def.label}
          value={fields[def.key]}
          onChange={update(def.key)}
        />
      ))}

      {fields.abstract && (
        <div style={{ margin: "12px 0" }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, marginBottom: 4, textTransform: "uppercase" }}>Abstract</div>
          <div style={{
            fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.inkSoft, lineHeight: 1.55,
            maxHeight: 120, overflow: "hidden",
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}>
            {fields.abstract}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onSave} style={{
          fontFamily: FONTS.serif, fontSize: 13, fontWeight: 500,
          padding: "9px 22px",
          background: TOKENS.accent, color: TOKENS.paperLight,
          border: "none", borderRadius: 2, cursor: "pointer",
        }}>Save to library →</button>
        <button onClick={onExtractAnother} style={{
          fontFamily: FONTS.serif, fontSize: 12,
          color: TOKENS.inkSoft, background: "transparent",
          border: `1px solid ${TOKENS.rule}`, borderRadius: 2, padding: "8px 16px",
          cursor: "pointer",
        }}>Clear</button>
      </div>
    </div>
  );
};

const ExtractionInstructions = () => (
  <div style={{
    padding: "32px 16px",
    fontFamily: FONTS.serif,
  }}>
    <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600, color: TOKENS.ink, marginBottom: 12 }}>
      How it works
    </div>
    {[
      {
        n: "1",
        title: "Paste anything",
        body: "Copy an abstract, a full BibTeX entry, or any text snippet from a paper. Claude reads everything and extracts only what's explicitly stated.",
      },
      {
        n: "2",
        title: "Review + edit",
        body: "Extracted fields appear on the right. Every field is editable — click ✎ to change a value, or toggle booleans directly.",
      },
      {
        n: "3",
        title: "Save to library",
        body: "The paper is added to your matrix instantly. It shows up in the Hub, respects all filters, and gets a thumbnail upload slot.",
      },
    ].map(s => (
      <div key={s.n} style={{
        display: "flex", gap: 14, marginBottom: 18,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.4)",
        border: `1px solid ${TOKENS.ruleFaint}`,
        borderRadius: 2,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: TOKENS.accent, color: TOKENS.paperLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700,
        }}>{s.n}</div>
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: 13, fontWeight: 600, color: TOKENS.ink, marginBottom: 3 }}>{s.title}</div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 12.5, color: TOKENS.inkSoft, lineHeight: 1.5 }}>{s.body}</div>
        </div>
      </div>
    ))}

    <div style={{
      padding: "12px 16px",
      background: `${TOKENS.highlight}44`,
      border: `1px dashed ${TOKENS.accent}`,
      borderRadius: 2,
      fontFamily: FONTS.serif, fontSize: 12, color: TOKENS.ink, lineHeight: 1.5,
    }}>
      <span style={{ fontFamily: FONTS.mono, fontWeight: 600, color: TOKENS.accent }}>Tip:</span>
      {" "}Works best with a full BibTeX entry — includes title, authors, abstract, doi, keywords all in one paste.
      Strict mode: Claude leaves fields blank rather than guessing.
    </div>
  </div>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

const ExtractionScreen = () => {
  const [apiKey, setApiKey] = React.useState(loadApiKey);
  const [showKeyEditor, setShowKeyEditor] = React.useState(false);
  const [inputText, setInputText] = React.useState("");
  const [fields, setFields] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const handleSaveKey = (k) => {
    const trimmed = (k || "").trim();
    setApiKey(trimmed);
    saveApiKey(trimmed);
    setShowKeyEditor(false);
  };

  const handleExtract = async () => {
    if (!apiKey.trim()) { setShowKeyEditor(true); return; }
    const text = inputText.trim();
    if (!text) { setError("Paste some text first."); return; }

    setLoading(true);
    setError("");
    setFields(null);
    setSaved(false);

    try {
      const result = await callClaude(apiKey, text);
      setFields(result);
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("CORS")) {
        setError(
          "Network / CORS error. This usually means index.html was opened directly as a file. " +
          "Serve it over HTTP instead: open a terminal, cd to this folder, run " +
          "python -m http.server 8080, then open http://localhost:8080"
        );
      } else {
        setError(`Extraction failed: ${msg}`);
      }
    }
    setLoading(false);
  };

  const handleSaveToLibrary = () => {
    if (!fields) return;
    const thumb =
      fields.bistable ? "bistable"
      : fields.miura   ? "miura"
      : fields.is4D    ? "flower"
      : "review";
    const newPaper = {
      id: `u${Date.now()}`,
      key: `user-${Date.now()}`,
      title:           fields.title || "Untitled",
      authors:         Array.isArray(fields.authors) ? fields.authors : [],
      year:            fields.year || null,
      venue:           fields.venue || "",
      doi:             fields.doi || "",
      abstract:        fields.abstract || "",
      keywords:        Array.isArray(fields.keywords) ? fields.keywords : [],
      is4D:            !!fields.is4D,
      bistable:        !!fields.bistable,
      miura:           !!fields.miura,
      fabrication:     fields.fabrication || "—",
      activeMaterial:  fields.activeMaterial || "—",
      passiveMaterial: fields.passiveMaterial || "—",
      stimulus:        Array.isArray(fields.stimulus) ? fields.stimulus : [],
      shapeChangeTime: fields.shapeChangeTime || "—",
      objectives:      fields.objectives || "",
      findings:        "",
      futurePotential: fields.futurePotential || "",
      citations: 0,
      starred: false,
      thumb,
      userThumbnail: "",
      needsThumbnail: true,
    };
    saveUserPaper(newPaper);
    if (!window.PAPERS.find(p => p.id === newPaper.id)) {
      window.PAPERS.push(newPaper);
    }
    // Notify FilterProvider to recompute so the new paper appears in the Hub immediately
    if (window.__starsListeners) window.__starsListeners.forEach(fn => fn());
    setSaved(true);
  };

  const reset = () => {
    setFields(null);
    setSaved(false);
    setInputText("");
    setError("");
  };

  return (
    <div style={{
      width: "100%", height: "100%",
      background: TOKENS.paper, fontFamily: FONTS.serif,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 24px", borderBottom: `1px solid ${TOKENS.rule}`,
        background: TOKENS.paperDeep,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 600, color: TOKENS.ink }}>
            AI extraction
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic", color: TOKENS.inkSoft }}>
            Paste an abstract or BibTeX entry — Claude reads and fills the matrix fields.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <ToolbarButton
          onClick={() => setShowKeyEditor(v => !v)}
          accent={!apiKey}>
          {apiKey ? "🔑 API key set" : "⚠ Add API key"}
        </ToolbarButton>
      </div>

      {/* API key editor (inline, expandable) */}
      {showKeyEditor && (
        <ApiKeyEditor
          apiKey={apiKey}
          onSave={handleSaveKey}
          onCancel={() => setShowKeyEditor(false)}
        />
      )}

      {/* API key status banner (when editor is closed) */}
      {!showKeyEditor && (
        <ApiKeyBanner apiKey={apiKey} onEdit={() => setShowKeyEditor(true)} />
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: input panel */}
        <div style={{
          width: 380, flexShrink: 0,
          borderRight: `1px solid ${TOKENS.rule}`,
          padding: 20, background: TOKENS.paperLight,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.2, color: TOKENS.inkFaint, textTransform: "uppercase" }}>
            Paste content
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={"Paste anything:\n\n• Full BibTeX entry (best)\n• Abstract text\n• Paper title + authors\n• Mix of any of the above\n\nClaude will extract only what's explicitly stated."}
            style={{
              flex: 1, resize: "none",
              fontFamily: FONTS.serif, fontSize: 12.5, lineHeight: 1.55,
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${inputText ? TOKENS.rule : TOKENS.ruleFaint}`,
              borderRadius: 2, padding: "10px 12px",
              color: TOKENS.ink, outline: "none",
            }}
          />

          {error && (
            <div style={{
              padding: "9px 12px",
              background: "rgba(168,71,43,0.07)",
              border: `1px solid ${TOKENS.accent}`,
              borderRadius: 2,
              fontFamily: FONTS.serif, fontSize: 11.5, fontStyle: "italic",
              color: TOKENS.accent, lineHeight: 1.45,
            }}>{error}</div>
          )}

          <button
            onClick={handleExtract}
            disabled={loading || !inputText.trim()}
            style={{
              fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600,
              padding: "11px 0",
              background: loading || !inputText.trim()
                ? "rgba(31,95,181,0.28)"
                : TOKENS.accent,
              color: TOKENS.paperLight,
              border: "none", borderRadius: 2,
              cursor: loading || !inputText.trim() ? "default" : "pointer",
              transition: "background 0.15s",
            }}>
            {loading ? "Extracting…" : "Extract with Claude →"}
          </button>

          {/* Hint: what to paste */}
          <div style={{
            fontFamily: FONTS.serif, fontSize: 10.5, fontStyle: "italic",
            color: TOKENS.inkFaint, lineHeight: 1.4, paddingBottom: 4,
          }}>
            BibTeX entries give the richest results — title, authors, year, venue,
            abstract, DOI, and keywords all in one paste.
          </div>
        </div>

        {/* Right: results / instructions panel */}
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <div style={{
                fontFamily: FONTS.display, fontSize: 20, fontWeight: 600,
                color: TOKENS.accent, marginBottom: 10,
              }}>Reading your text…</div>
              <div style={{
                fontFamily: FONTS.serif, fontSize: 13, fontStyle: "italic",
                color: TOKENS.inkSoft,
              }}>
                Claude is extracting structured fields. Usually takes 3–8 seconds.
              </div>
              <div style={{ marginTop: 24 }}>
                {[0.15, 0.45, 0.70, 0.90].map((w, i) => (
                  <div key={i} style={{
                    height: 8, background: TOKENS.ruleFaint,
                    borderRadius: 4, marginBottom: 8, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: `${w * 100}%`,
                      background: TOKENS.accent, opacity: 0.5,
                    }} />
                  </div>
                ))}
              </div>
            </div>
          ) : fields ? (
            <ExtractionResults
              fields={fields}
              onChange={setFields}
              onSave={handleSaveToLibrary}
              onExtractAnother={reset}
              saved={saved}
            />
          ) : (
            <ExtractionInstructions />
          )}
        </div>
      </div>
    </div>
  );
};

window.ExtractionScreen = ExtractionScreen;
