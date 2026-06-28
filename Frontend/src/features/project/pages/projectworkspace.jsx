import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import JSZip from "jszip";
import AppLayout from "../component/AppLayout";
import useProject from "../hooks/useProject";
import styles from "../styles/projectworkspace.module.css";

// ─── Prettier-style formatter ─────────────────────────────────────────────────
// Formats HTML, CSS, or JS content with proper indentation (no external deps).

function formatHTML(raw) {
  if (!raw) return "";
  const INDENT = "  ";
  // Self-closing tags
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr", "!doctype", "!DOCTYPE",
  ]);

  const result = [];
  let indent = 0;
  // Tokenize: split on tags vs text
  const tokens = raw.split(/(<[^>]+>)/g);

  for (let tok of tokens) {
    tok = tok.trim();
    if (!tok) continue;

    if (tok.startsWith("</")) {
      // Closing tag — dedent first
      indent = Math.max(0, indent - 1);
      result.push(INDENT.repeat(indent) + tok);
    } else if (tok.startsWith("<!--")) {
      // Comment
      result.push(INDENT.repeat(indent) + tok);
    } else if (tok.startsWith("<")) {
      // Opening / self-closing tag
      const tagName = (tok.match(/<([^\s/>!]+)/) || [])[1] || "";
      const isSelfClosing = tok.endsWith("/>") || voidTags.has(tagName.toLowerCase());
      result.push(INDENT.repeat(indent) + tok);
      if (!isSelfClosing) indent++;
    } else {
      // Text content
      result.push(INDENT.repeat(indent) + tok);
    }
  }
  return result.join("\n");
}

function formatCSS(raw) {
  if (!raw) return "";
  const INDENT = "  ";
  // Normalise spacing
  let code = raw
    .replace(/\s*\{\s*/g, " {\n")
    .replace(/;\s*/g, ";\n")
    .replace(/\s*\}\s*/g, "\n}\n")
    .replace(/\/\*(.+?)\*\//gs, (m) => m)   // preserve comments
    .trim();

  const lines = code.split("\n");
  let depth = 0;
  const out = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line === "}") {
      depth = Math.max(0, depth - 1);
      out.push(INDENT.repeat(depth) + "}");
    } else if (line.endsWith("{")) {
      out.push(INDENT.repeat(depth) + line);
      depth++;
    } else {
      out.push(INDENT.repeat(depth) + line);
    }
  }
  return out.join("\n");
}

function formatJS(raw) {
  if (!raw) return "";
  const INDENT = "  ";

  // ── Step 1: Expand minified / single-line JS ──────────────────────────────
  // If the entire file is essentially one line, insert newlines at natural
  // statement boundaries before doing indentation.
  const lineCount = (raw.match(/\n/g) || []).length;
  // Treat as minified/unformatted if the average line is longer than 120 chars.
  // This catches both truly single-line JS and "semi-minified" code where the
  // AI wraps everything in a DOMContentLoaded block with only a handful of \n.
  const avgLineLen = raw.length / Math.max(lineCount + 1, 1);
  const isMinified = avgLineLen > 120;

  let src = raw;
  if (isMinified) {
    // Tokenise-and-expand: walk character-by-character, track string/template/
    // regex context so we never split inside a literal.
    let result = "";
    let i = 0;
    let inSingleStr = false;  // '
    let inDoubleStr = false;  // "
    let inTemplate = false;  // `
    let inLineComment = false;
    let inBlockComment = false;

    while (i < src.length) {
      const ch = src[i];
      const next = src[i + 1] ?? "";

      // ── Comment handling ───────────────────────────────────────────────
      if (!inSingleStr && !inDoubleStr && !inTemplate) {
        if (!inBlockComment && ch === "/" && next === "/") {
          inLineComment = true;
          result += ch; i++; continue;
        }
        if (inLineComment) {
          if (ch === "\n") { inLineComment = false; result += "\n"; i++; continue; }
          result += ch; i++; continue;
        }
        if (!inLineComment && ch === "/" && next === "*") {
          inBlockComment = true;
          result += ch; i++; continue;
        }
        if (inBlockComment) {
          if (ch === "*" && next === "/") {
            inBlockComment = false;
            result += "*/"; i += 2; continue;
          }
          result += ch; i++; continue;
        }
      }

      // ── String / template literal entry/exit ──────────────────────────
      if (!inSingleStr && !inDoubleStr && !inTemplate && ch === "'") { inSingleStr = true; result += ch; i++; continue; }
      if (!inSingleStr && !inDoubleStr && !inTemplate && ch === '"') { inDoubleStr = true; result += ch; i++; continue; }
      if (!inSingleStr && !inDoubleStr && !inTemplate && ch === "`") { inTemplate = true; result += ch; i++; continue; }

      if (inSingleStr) {
        result += ch;
        if (ch === "\\") { result += next; i += 2; continue; }
        if (ch === "'") { inSingleStr = false; }
        i++; continue;
      }
      if (inDoubleStr) {
        result += ch;
        if (ch === "\\") { result += next; i += 2; continue; }
        if (ch === '"') { inDoubleStr = false; }
        i++; continue;
      }
      if (inTemplate) {
        result += ch;
        if (ch === "\\") { result += next; i += 2; continue; }
        if (ch === "`") { inTemplate = false; }
        i++; continue;
      }

      // ── Structural characters — insert newlines ────────────────────────
      if (ch === "{" || ch === "[" || ch === "(") {
        result += ch + "\n";
        i++; continue;
      }
      if (ch === "}" || ch === "]" || ch === ")") {
        result += "\n" + ch;
        // If immediately followed by ; keep it on same line
        if (next === ";") { result += ";"; i += 2; }
        else { i++; }
        result += "\n";
        continue;
      }
      if (ch === ";") {
        result += ";\n"; i++; continue;
      }

      result += ch;
      i++;
    }
    src = result;
  }

  // ── Step 2: Apply indentation line-by-line ────────────────────────────────
  const lines = src.split("\n");
  let depth = 0;
  const out = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) { out.push(""); continue; }

    const opens = (line.match(/[{[(]/g) || []).length;
    const closes = (line.match(/[}\])]/g) || []).length;

    if (closes > opens) depth = Math.max(0, depth - (closes - opens));

    out.push(INDENT.repeat(depth) + line);

    if (opens > closes) depth += (opens - closes);
  }

  // ── Step 3: Collapse excessive blank lines ────────────────────────────────
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

// ─── Syntax Tokenizer ────────────────────────────────────────────────────────
// Returns an array of { text, cls } segments for a single line based on lang.

function tokenizeLine(line, lang) {
  if (lang === "html") return tokenizeHTML(line);
  if (lang === "css") return tokenizeCSS(line);
  if (lang === "js") return tokenizeJS(line);
  return [{ text: line, cls: "plain" }];
}

function tokenizeHTML(line) {
  const segs = [];
  let rest = line;

  // Comment
  if (rest.trimStart().startsWith("<!--")) {
    return [{ text: rest, cls: "comment" }];
  }

  // DOCTYPE / tag
  const tagRe = /(<\/?)([^\s/>!]+)([^>]*)(\/?>)/;
  const m = rest.match(tagRe);
  if (m) {
    const pre = rest.slice(0, rest.indexOf(m[0]));
    if (pre) segs.push({ text: pre, cls: "plain" });

    segs.push({ text: m[1] + m[2], cls: "tag" });

    // Attribute string
    const attrStr = m[3];
    // Split on "value" strings
    const attrParts = attrStr.split(/(=["'][^"']*["'])/g);
    attrParts.forEach((p) => {
      if (!p) return;
      if (/^=["']/.test(p)) segs.push({ text: p, cls: "string" });
      else segs.push({ text: p, cls: "attr" });
    });

    segs.push({ text: m[4], cls: "tag" });

    const post = rest.slice(rest.indexOf(m[0]) + m[0].length);
    if (post) segs.push({ text: post, cls: "plain" });
    return segs;
  }

  return [{ text: rest, cls: "plain" }];
}

function tokenizeCSS(line) {
  const segs = [];

  // Comment
  if (line.trim().startsWith("/*")) return [{ text: line, cls: "comment" }];

  // Property: value;
  const propRe = /^(\s*)([\w-]+)(\s*:\s*)(.+?)(;?)(\s*)$/;
  const m = line.match(propRe);
  if (m) {
    if (m[1]) segs.push({ text: m[1], cls: "plain" });
    segs.push({ text: m[2], cls: "attr" });      // property name
    segs.push({ text: m[3], cls: "plain" });      // colon
    // Highlight strings/hex/numbers inside value
    const val = m[4];
    const valParts = val.split(/(#[0-9a-fA-F]{3,8}|"[^"]*"|'[^']*'|\d+(?:px|em|rem|%|vh|vw|s|ms)?)/g);
    valParts.forEach((vp) => {
      if (!vp) return;
      if (/^(#|"|')/.test(vp) || /^\d/.test(vp)) segs.push({ text: vp, cls: "string" });
      else segs.push({ text: vp, cls: "plain" });
    });
    if (m[5]) segs.push({ text: m[5], cls: "plain" });
    return segs;
  }

  // Selector
  return [{ text: line, cls: "tag" }];
}

function tokenizeJS(line) {
  const segs = [];
  const trim = line.trim();

  // Comment
  if (trim.startsWith("//") || trim.startsWith("/*") || trim.startsWith("*"))
    return [{ text: line, cls: "comment" }];

  // Keyword list
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|async|await|new|this|true|false|null|undefined|typeof|instanceof|try|catch|finally|throw|switch|case|break|continue)\b/g;

  // Strings
  const strRe = /(["'`])(?:(?!\1).)*\1/g;

  // We'll do a multi-pass: collect string ranges, keyword ranges, rest is plain
  let annotated = []; // { start, end, cls }

  let sm;
  strRe.lastIndex = 0;
  while ((sm = strRe.exec(line)) !== null) {
    annotated.push({ start: sm.index, end: sm.index + sm[0].length, cls: "string" });
  }

  keywords.lastIndex = 0;
  let km;
  while ((km = keywords.exec(line)) !== null) {
    // Skip if already inside a string range
    const inside = annotated.some(a => a.cls === "string" && km.index >= a.start && km.index < a.end);
    if (!inside) annotated.push({ start: km.index, end: km.index + km[0].length, cls: "keyword" });
  }

  // Sort by start
  annotated.sort((a, b) => a.start - b.start);
  // Fill gaps
  let cursor = 0;
  for (const seg of annotated) {
    if (seg.start > cursor) segs.push({ text: line.slice(cursor, seg.start), cls: "plain" });
    segs.push({ text: line.slice(seg.start, seg.end), cls: seg.cls });
    cursor = seg.end;
  }
  if (cursor < line.length) segs.push({ text: line.slice(cursor), cls: "plain" });
  return segs.length ? segs : [{ text: line, cls: "plain" }];
}

// ─── Code Display ─────────────────────────────────────────────────────────────
const clsMap = {
  tag: styles.tokenTag,
  attr: styles.tokenAttr,
  string: styles.tokenString,
  plain: styles.tokenContent,
  comment: styles.tokenComment,
  keyword: styles.tokenKeyword,
};

const CodeLine = ({ line, lang }) => {
  const segs = tokenizeLine(line, lang);
  return (
    <>
      {segs.map((s, i) => (
        <span key={i} className={clsMap[s.cls] || styles.tokenContent}>
          {s.text}
        </span>
      ))}
    </>
  );
};

// ─── IDE Panel ────────────────────────────────────────────────────────────────
const FILE_TABS = [
  { key: "html", label: "HTML", icon: "html", name: "index.html", color: "#f97316" },
  { key: "css", label: "CSS", icon: "css", name: "style.css", color: "#38bdf8" },
  { key: "js", label: "JS", icon: "code", name: "script.js", color: "#facc15" },
];

const IDEPanel = ({ title, fileData, loading }) => {
  const [activeTab, setActiveTab] = useState("html");
  const [isDownloading, setIsDownloading] = useState(false);

  // Get raw content from fileData array
  const getContent = (name) => {
    if (!Array.isArray(fileData)) return "";
    return fileData.find((f) => f.name === name)?.content || "";
  };

  // Format on demand — memoized so it only runs when fileData changes
  const formatted = useMemo(() => {
    return {
      html: formatHTML(getContent("index.html")),
      css: formatCSS(getContent("style.css")),
      js: formatJS(getContent("script.js")),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData]);

  const activeTabMeta = FILE_TABS.find((t) => t.key === activeTab);
  const code = formatted[activeTab] || "";
  const lines = code ? code.split("\n") : [];
  const lineCount = Math.max(lines.length, 20);

  // ── Download all three files as a ZIP ──────────────────────────────
  const handleDownloadZip = async () => {
    if (isDownloading || !Array.isArray(fileData) || fileData.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folderName = title ? title.replace(/[^a-z0-9_-]/gi, "_") : "getweb_project";
      const folder = zip.folder(folderName);

      // Add each file using raw content (not formatted) to preserve original code
      folder.file("index.html", getContent("index.html") || "");
      folder.file("style.css",  getContent("style.css")  || "");
      folder.file("script.js",  getContent("script.js")  || "");

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download ZIP error:", err);
    } finally {
      // Brief delay so the user sees the feedback
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const hasFiles = Array.isArray(fileData) && fileData.length > 0;

  return (
    <section className={styles.idePanel}>
      {/* Top Bar — Save only, no file tabs so brand is never covered */}
      <div className={styles.ideTopBar}>
        <div className={styles.ideTopBarLeft}>
          <span className={styles.idePanelLabel}>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            </span>
          </span>
        </div>
        <div className={styles.tabBarActions}>
          {isDownloading ? (
            <span className={styles.savedLabel}>
              <span
                className="material-symbols-outlined animate-spin-slow"
                style={{ fontSize: "13px", verticalAlign: "middle", marginRight: 4 }}
              >
                progress_activity
              </span>
              Packaging ZIP...
            </span>
          ) : (
            hasFiles && (
              <span className={styles.savedLabel}>Ready to download</span>
            )
          )}
          <button
            className={styles.saveBtn}
            onClick={handleDownloadZip}
            disabled={isDownloading || !hasFiles}
            title={hasFiles ? "Download project as ZIP" : "No files to download yet"}
          >
            {isDownloading ? (
              <>
                <span
                  className="material-symbols-outlined animate-spin-slow"
                  style={{ fontSize: "14px" }}
                >
                  progress_activity
                </span>
                Zipping...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  download
                </span>
                DOWNLOAD
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compiling Banner */}
      {loading && (
        <div className={styles.compilingBanner}>
          <div className={styles.compilingLeft}>
            <span className={`material-symbols-outlined animate-pulse ${styles.compilingIcon}`}>
              memory
            </span>
            Gemini Compiling Sequence...
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} />
          </div>
        </div>
      )}

      {/* Code Display Area */}
      <div className={styles.codeArea}>
        {/* Line numbers */}
        <div className={styles.lineNumbers}>
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        

        {/* Code content */}
        <div className={styles.codeContent}>
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <div key={i}>
                <CodeLine line={line} lang={activeTab} />
              </div>
            ))
          ) : (
            // Placeholder when no file data yet
            <div className={styles.tokenComment}>
              {`// ${activeTabMeta?.label || "Code"} will appear here after generation…`}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar — file switcher lives here */}
      <div className={styles.ideBottomTabBar}>
        {FILE_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.fileTab} ${activeTab === tab.key ? styles.fileTabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? { "--tab-color": tab.color } : {}}
          >
            <span
              className={`material-symbols-outlined ${styles.tabIcon}`}
              style={{ color: activeTab === tab.key ? tab.color : undefined }}
            >
              {tab.icon}
            </span>
            <span className={styles.tabLabel}>
              {title && activeTab === tab.key
                ? `${title}.${tab.key === "html" ? "html" : tab.key === "css" ? "css" : "js"}`
                : tab.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

// ─── Sandbox Preview Panel ────────────────────────────────────────────────────
const PreviewPanel = ({ fileData, loading }) => {
  const [activeViewport, setActiveViewport] = useState("tablet");
  const [fullscreenViewport, setFullscreenViewport] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [viewportPopup, setViewportPopup] = useState(null);

  const getScreenType = () => {
    const w = window.innerWidth;
    if (w <= 640) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
  };

  const POPUP_MESSAGES = {
    desktop: {
      title: "Open in Desktop",
      desc: "This view is best experienced on a larger screen. Open this page on a desktop browser for the full desktop preview.",
    },
    tablet: {
      title: "Open in Tablet View",
      desc: "Switch to a tablet or larger screen to use the tablet preview mode.",
    },
  };

  const handleViewportClick = (key) => {
    const screen = getScreenType();

    if (screen === "mobile") {
      if (key === "desktop") {
        setViewportPopup("desktop");
        return;
      }
      if (key === "tablet") {
        setViewportPopup("tablet");
        return;
      }
      if (key === "mobile") {
        setActiveViewport(key);
        setIsExiting(false);
        setFullscreenViewport("mobile");
        return;
      }
    }

    if (screen === "tablet") {
      if (key === "desktop") {
        setViewportPopup("desktop");
        return;
      }
      if (key === "tablet") {
        setActiveViewport(key);
        setIsExiting(false);
        setFullscreenViewport("tablet");
        return;
      }
    }

    if (key === "desktop") {
      setActiveViewport(key);
      setIsExiting(false);
      setFullscreenViewport("desktop");
    } else if (fullscreenViewport) {
      setIsExiting(true);
      setTimeout(() => {
        setFullscreenViewport(null);
        setIsExiting(false);
        setActiveViewport(key);
      }, 380);
    } else {
      setActiveViewport(key);
    }
  };

  const exitFullscreen = () => {
    setIsExiting(true);
    setTimeout(() => {
      setFullscreenViewport(null);
      setIsExiting(false);
      const screen = getScreenType();
      if (screen === "mobile") {
        setActiveViewport("mobile");
      } else if (screen === "tablet") {
        setActiveViewport("tablet");
      } else {
        setActiveViewport("tablet");
      }
    }, 380);
  };

  const buildSrcdoc = () => {
    if (!Array.isArray(fileData)) return null;

    const html = fileData.find((f) => f.name === "index.html")?.content || "";
    const css = fileData.find((f) => f.name === "style.css")?.content || "";
    const script = fileData.find((f) => f.name === "script.js")?.content || "";

    if (!html) return null;

    let doc = html;
    const injectedCss = css ? `<style>${css}</style>` : "";
    const injectedScript = script ? `<script>${script}</script>` : "";

    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", `${injectedCss}</head>`);
    } else {
      doc = injectedCss + doc;
    }
    if (doc.includes("</body>")) {
      doc = doc.replace("</body>", `${injectedScript}</body>`);
    } else {
      doc = doc + injectedScript;
    }
    return doc;
  };

  const srcdoc = buildSrcdoc();
  const hasContent = !loading && srcdoc;

  const viewports = [
    { key: "desktop", icon: "desktop_windows" },
    { key: "tablet", icon: "tablet_mac", width: "768px" },
    { key: "mobile", icon: "smartphone", width: "390px" },
  ];

  const activeViewportWidth =
    viewports.find((v) => v.key === activeViewport)?.width ?? "100%";

  return (
    <section className={styles.previewPanel}>

      {/* Preview Canvas */}
      <div className={styles.previewCanvas}>

        {/* Floating viewport pill */}
        <div className={styles.viewportPill}>
          {viewports.map(({ key, icon }) => (
            <button
              key={key}
              className={`${styles.viewportBtn} ${activeViewport === key ? styles.viewportBtnActive : ""}`}
              onClick={() => handleViewportClick(key)}
              title={key.charAt(0).toUpperCase() + key.slice(1)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                {icon}
              </span>
            </button>
          ))}
        </div>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.skeletonGroup}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonLarge}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonMedium}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonSmall}`} />
            </div>
            <div className={styles.loadingLabel}>
              <span
                className="material-symbols-outlined animate-pulse"
                style={{ color: "var(--color-primary)" }}
              >
                data_object
              </span>
              SYNTHESIZING DOM STRUCTURE...
            </div>
          </div>
        )}

        {hasContent && !fullscreenViewport && (
          <div
            className={activeViewport === "desktop" ? styles.iframeContainer : styles.iframeContainerConstrained}
            style={
              activeViewport === "desktop"
                ? {}
                : {
                    width: activeViewportWidth,
                    transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }
            }
          >
            <iframe
              className={styles.sandboxFrame}
              srcDoc={srcdoc}
              title="Sandbox Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        {!loading && !srcdoc && (
          <div className={styles.previewEmpty}>
            <div className={styles.previewEmptyGlow} />
            <div className={styles.previewEmptyIcon}>
              <span className="material-symbols-outlined">token</span>
            </div>
            <h2 className={styles.previewEmptyHeadline}>Intelligence defined.</h2>
            <p className={styles.previewEmptyBody}>
              Your AI-generated page structure will compile and render here at the edge.
            </p>
          </div>
        )}

        {/* Viewport Hint Popup */}
        {viewportPopup && (
          <div className={styles.viewportPopup}>
            <span className={`material-symbols-outlined ${styles.viewportPopupIcon}`}>
              open_in_new
            </span>
            <div className={styles.viewportPopupBody}>
              <span className={styles.viewportPopupTitle}>
                {POPUP_MESSAGES[viewportPopup].title}
              </span>
              <span className={styles.viewportPopupDesc}>
                {POPUP_MESSAGES[viewportPopup].desc}
              </span>
            </div>
            <span
              className={`material-symbols-outlined ${styles.viewportPopupClose}`}
              onClick={() => setViewportPopup(null)}
              style={{ fontSize: "16px" }}
            >
              close
            </span>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {fullscreenViewport && hasContent && (
        <div
          className={`${styles.desktopFullscreenOverlay} ${isExiting ? styles.desktopFullscreenExiting : ""}`}
        >
          <div className={styles.desktopFullscreenBar}>
            <div className={styles.desktopFullscreenActions}>
              <span className={styles.desktopFullscreenLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  {fullscreenViewport === "desktop"
                    ? "desktop_windows"
                    : fullscreenViewport === "tablet"
                    ? "tablet_mac"
                    : "smartphone"}
                </span>
                {fullscreenViewport === "desktop"
                  ? "Desktop View"
                  : fullscreenViewport === "tablet"
                  ? "Tablet View"
                  : "Mobile View"}
              </span>
              <button
                className={styles.exitFullscreenBtn}
                onClick={exitFullscreen}
                title={`Exit ${fullscreenViewport} fullscreen`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  close_fullscreen
                </span>
                Exit {fullscreenViewport === "desktop"
                  ? "Fullscreen"
                  : fullscreenViewport === "tablet"
                  ? "Tablet View"
                  : "Mobile View"}
              </button>
            </div>
          </div>
          <div className={styles.desktopFullscreenFrame}>
            <iframe
              className={styles.sandboxFrame}
              srcDoc={srcdoc}
              title={`Sandbox Preview — ${fullscreenViewport}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </section>
  );
};

// ─── Project Workspace Page ───────────────────────────────────────────────────
const ProjectWorkspacePage = () => {
  const [searchParams] = useSearchParams();
  const { handleGetProject, fileData, loading, title } = useProject();

  const projectId = searchParams.get("id");

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) await handleGetProject(projectId);
    };
    fetchProject();
  }, [projectId]);

  return (
    <AppLayout>
      <div className={styles.workspaceRoot}>
        <IDEPanel title={title} fileData={fileData} loading={loading} />
        <PreviewPanel fileData={fileData} loading={loading} />
      </div>
    </AppLayout>
  );
};

export default ProjectWorkspacePage;
