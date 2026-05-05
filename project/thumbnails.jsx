// Thumbnail upload + storage module
// Click a thumbnail → file picker → image saved as data-URL in localStorage.
// Any row showing the same paper picks up the new thumbnail immediately.

const THUMB_KEY = "folio_thumbnails_v1";

// In-memory cache so all hook consumers re-render together
let __thumbCache = null;
const __thumbListeners = new Set();

function loadCache() {
  if (__thumbCache !== null) return __thumbCache;
  try {
    const raw = localStorage.getItem(THUMB_KEY);
    __thumbCache = raw ? JSON.parse(raw) : {};
  } catch (e) {
    __thumbCache = {};
  }
  return __thumbCache;
}

function saveCache() {
  try {
    localStorage.setItem(THUMB_KEY, JSON.stringify(__thumbCache));
  } catch (e) {
    console.warn("Could not save thumbnails (quota?):", e);
  }
}

function setThumbnail(paperId, dataUrl) {
  loadCache();
  if (dataUrl == null) delete __thumbCache[paperId];
  else __thumbCache[paperId] = dataUrl;
  saveCache();
  __thumbListeners.forEach(fn => fn());
}

function getThumbnail(paperId) {
  return loadCache()[paperId] || null;
}

function useThumbnail(paperId) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    __thumbListeners.add(fn);
    return () => __thumbListeners.delete(fn);
  }, []);
  return getThumbnail(paperId);
}

// Compress an image File to a smaller data URL (max 256px, JPEG q=0.82)
async function fileToCompressedDataUrl(file, maxDim = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#F4EBDC";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Hidden <input type="file"> singleton — reused across clicks
let __filePicker = null;
function pickImageFile() {
  return new Promise((resolve) => {
    if (!__filePicker) {
      __filePicker = document.createElement("input");
      __filePicker.type = "file";
      __filePicker.accept = "image/*";
      __filePicker.style.display = "none";
      document.body.appendChild(__filePicker);
    }
    __filePicker.value = "";
    __filePicker.onchange = () => {
      const f = __filePicker.files && __filePicker.files[0];
      resolve(f || null);
    };
    __filePicker.click();
  });
}

async function pickAndStoreThumbnail(paperId) {
  const file = await pickImageFile();
  if (!file) return null;
  const dataUrl = await fileToCompressedDataUrl(file);
  setThumbnail(paperId, dataUrl);
  return dataUrl;
}

// Convert any image source (Blob/File or data URL string) into a compressed data URL
async function blobToCompressedDataUrl(blob, maxDim = 256) {
  return fileToCompressedDataUrl(blob, maxDim);
}

async function dataUrlToCompressed(dataUrl, maxDim = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#F4EBDC";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// === UPLOAD MODAL ===
// Supports: paste (Cmd/Ctrl+V), drag-and-drop, file picker, paste URL/data-URL
const UploadModal = ({ paperId, paperTitle, onClose }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [urlText, setUrlText] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const finish = async (dataUrl) => {
    setBusy(true);
    try {
      const compressed = await dataUrlToCompressed(dataUrl);
      setThumbnail(paperId, compressed);
      onClose();
    } catch (e) {
      setError("Could not process image.");
      setBusy(false);
    }
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please drop an image file.");
      return;
    }
    setBusy(true); setError("");
    try {
      const compressed = await blobToCompressedDataUrl(file);
      setThumbnail(paperId, compressed);
      onClose();
    } catch (e) {
      setError("Could not read file.");
      setBusy(false);
    }
  };

  // Global paste listener while modal is open
  React.useEffect(() => {
    const onPaste = async (e) => {
      const items = e.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) { await handleFile(blob); return; }
        }
      }
      // text paste → maybe a URL
      const text = e.clipboardData?.getData("text");
      if (text && /^https?:\/\/|^data:image\//.test(text.trim())) {
        setUrlText(text.trim());
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [paperId]);

  // Esc to close
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onURLSubmit = async () => {
    if (!urlText.trim()) return;
    setBusy(true); setError("");
    const v = urlText.trim();
    try {
      if (v.startsWith("data:image/")) {
        await finish(v);
        return;
      }
      // Try fetching as blob (only works if CORS allows)
      const res = await fetch(v);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("not image");
      await handleFile(blob);
    } catch (err) {
      setError("Couldn't load that URL (often blocked by CORS). Try drag, paste, or file upload instead.");
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(20, 14, 8, 0.55)",
      backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONTS.serif,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 520, background: TOKENS.paperLight,
        border: `1px solid ${TOKENS.ink}`,
        boxShadow: "0 12px 40px rgba(20,14,8,0.35), 0 0 0 1px rgba(60,40,20,0.15)",
        position: "relative",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${TOKENS.rule}`,
          background: TOKENS.paperDeep,
          display: "flex", alignItems: "baseline", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: FONTS.display, fontSize: 16, fontWeight: 600,
              color: TOKENS.ink, letterSpacing: -0.2,
            }}>Add graphical abstract</div>
            <div style={{
              fontFamily: FONTS.serif, fontSize: 11, fontStyle: "italic",
              color: TOKENS.inkSoft, marginTop: 2,
              maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{paperTitle}</div>
          </div>
          <span onClick={onClose} style={{
            cursor: "pointer", fontFamily: FONTS.mono, fontSize: 16,
            color: TOKENS.inkFaint, padding: "0 4px",
          }}>✕</span>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          style={{
            margin: 20,
            padding: "36px 20px",
            border: `2px dashed ${dragOver ? TOKENS.accent : TOKENS.rule}`,
            background: dragOver ? "rgba(168,71,43,0.06)" : "rgba(255,255,255,0.4)",
            textAlign: "center",
            transition: "all 0.12s",
          }}>
          <div style={{
            fontFamily: FONTS.hand, fontSize: 26, color: TOKENS.accent,
            lineHeight: 1, marginBottom: 8,
          }}>{busy ? "processing…" : dragOver ? "drop it!" : "Paste a screenshot"}</div>
          <div style={{
            fontFamily: FONTS.serif, fontSize: 13, color: TOKENS.inkSoft, lineHeight: 1.5,
          }}>
            <span style={{
              fontFamily: FONTS.mono, fontSize: 11, color: TOKENS.ink,
              background: TOKENS.paperDeep, padding: "1px 6px",
              border: `1px solid ${TOKENS.rule}`, borderRadius: 2,
            }}>{navigator.platform.includes("Mac") ? "⌘V" : "Ctrl+V"}</span>
            {" "}from your snipping tool, or drag an image here, or
            {" "}<span onClick={() => pickImageFile().then(f => f && handleFile(f))} style={{
              color: TOKENS.accent, textDecoration: "underline",
              textDecorationStyle: "dashed", textUnderlineOffset: 3,
              cursor: "pointer",
            }}>upload a file</span>.
          </div>
        </div>

        {/* Divider with OR */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 20px", marginBottom: 12,
          fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.5,
          color: TOKENS.inkFaint,
        }}>
          <div style={{ flex: 1, height: 1, background: TOKENS.ruleFaint }} />
          OR
          <div style={{ flex: 1, height: 1, background: TOKENS.ruleFaint }} />
        </div>

        {/* URL input */}
        <div style={{
          display: "flex", gap: 8, padding: "0 20px 20px",
        }}>
          <input
            type="text"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onURLSubmit()}
            placeholder="paste image URL or data:image/…"
            style={{
              flex: 1,
              fontFamily: FONTS.serif, fontSize: 13,
              padding: "8px 12px",
              background: "rgba(255,255,255,0.6)",
              border: `1px solid ${TOKENS.rule}`, borderRadius: 2,
              color: TOKENS.ink, outline: "none",
            }}
          />
          <button onClick={onURLSubmit} disabled={!urlText.trim() || busy} style={{
            fontFamily: FONTS.serif, fontSize: 13, fontWeight: 500,
            padding: "8px 18px",
            background: urlText.trim() ? TOKENS.accent : "rgba(168,71,43,0.3)",
            color: TOKENS.paperLight,
            border: "none", borderRadius: 2,
            cursor: urlText.trim() ? "pointer" : "default",
          }}>Load</button>
        </div>

        {error && (
          <div style={{
            margin: "0 20px 16px",
            padding: "8px 12px",
            background: "rgba(168,71,43,0.08)",
            border: `1px solid ${TOKENS.accent}`,
            fontFamily: FONTS.serif, fontSize: 12, fontStyle: "italic",
            color: TOKENS.accent,
          }}>{error}</div>
        )}
      </div>
    </div>
  );
};

// Hook to control modal state — wraps in a single global instance
let __modalSetState = null;
function openUploadModal(paperId, paperTitle) {
  if (__modalSetState) __modalSetState({ paperId, paperTitle });
}
function UploadModalHost() {
  const [state, setState] = React.useState(null);
  React.useEffect(() => { __modalSetState = setState; return () => { __modalSetState = null; }; }, []);
  if (!state) return null;
  return <UploadModal paperId={state.paperId} paperTitle={state.paperTitle} onClose={() => setState(null)} />;
}

// Clickable thumbnail wrapper used by the matrix row
const ClickableThumb = ({ paper, size = 50, frameSize = 56 }) => {
  const userThumb = useThumbnail(paper.id);
  const [hover, setHover] = React.useState(false);

  const onClick = (e) => {
    e.stopPropagation();
    window.openUploadModal(paper.id, paper.title);
  };

  const onContext = (e) => {
    if (!userThumb) return;
    e.preventDefault();
    if (confirm("Remove this thumbnail?")) setThumbnail(paper.id, null);
  };

  return (
    <div onClick={onClick} onContextMenu={onContext}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      title={userThumb ? "Click to replace · right-click to remove" : "Click to upload graphical abstract"}
      style={{
        width: frameSize, height: frameSize,
        border: `1px solid ${hover ? TOKENS.accent : TOKENS.rule}`,
        background: TOKENS.paperLight, padding: 2,
        boxShadow: hover ? "0 1px 4px rgba(168,71,43,0.25)" : "1px 1px 0 rgba(60,40,20,0.08)",
        position: "relative",
        cursor: "pointer",
        transition: "border-color 0.12s, box-shadow 0.12s",
      }}>
      {userThumb ? (
        <img src={userThumb} alt="" style={{
          width: "100%", height: "100%", objectFit: "cover",
          display: "block",
        }} />
      ) : (
        <Thumb kind={paper.thumb} size={size} />
      )}
      {hover && (
        <div style={{
          position: "absolute", inset: 0,
          background: userThumb ? "rgba(244,235,220,0.65)" : "rgba(168,71,43,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FONTS.mono, fontSize: 9, color: TOKENS.accent,
          letterSpacing: 0.5, fontWeight: 600,
          pointerEvents: "none",
        }}>{userThumb ? "replace" : "+ upload"}</div>
      )}
    </div>
  );
};

window.useThumbnail = useThumbnail;
window.setThumbnail = setThumbnail;
window.getThumbnail = getThumbnail;
window.pickAndStoreThumbnail = pickAndStoreThumbnail;
window.openUploadModal = openUploadModal;
window.UploadModalHost = UploadModalHost;
window.ClickableThumb = ClickableThumb;
