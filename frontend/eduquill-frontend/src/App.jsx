import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API_BASE = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [providerType, setProviderType] = useState("ollama");
  const [model, setModel] = useState("qwen2.5:14b-instruct");
  const [apiKey, setApiKey] = useState("");

  const uploadDoc = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post(`${API_BASE}/api/v1/documents/upload`, formData);
      alert("✅ Document uploaded & indexed!");
    } catch (err) {
      console.error(err);
      setError("Failed to upload document. Check backend logs.");
    } finally {
      setIsUploading(false);
    }
  };

  const ask = async () => {
    if (!query.trim()) {
      setError("Please type a question first.");
      return;
    }
    setError("");
    setIsAsking(true);
    try {
      const res = await axios.post(`${API_BASE}/api/v1/chat/query`, {
        query,
        session_id: "demo-student-1",
        k: 4,
        model: model,
        provider_type: providerType,
        api_key: providerType === "groq" && apiKey ? apiKey : null,
      });
      setAnswer(res.data.answer || "");
      setSources(res.data.sources || []);
    } catch (err) {
      console.error(err);
      setError("Failed to get an answer. Check backend logs.");
    } finally {
      setIsAsking(false);
    }
  };

  // Modèles disponibles selon le provider
  const getAvailableModels = () => {
    if (providerType === "ollama") {
      return [
        { value: "qwen2.5:14b-instruct", label: "Qwen 2.5 14B Instruct" },
        { value: "llama3", label: "Llama 3" },
        { value: "llama3.2", label: "Llama 3.2" },
        { value: "mistral", label: "Mistral" },
        { value: "mixtral", label: "Mixtral" },
        { value: "qwen2.5", label: "Qwen 2.5" },
        { value: "phi3", label: "Phi-3" },
      ];
    } else {
      // Groq models - organized by use case
      return [
        // Premium / Gold models
        { value: "openai/gpt-oss-120b", label: "GPT OSS 120B ⭐ (Best Quality)" },
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
        { value: "qwen-3-32b", label: "Qwen 3 32B (Multilingual)" },
        
        // Standard models
        { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
        { value: "openai/gpt-oss-20b", label: "GPT OSS 20B (Fast & Efficient)" },
        { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
        { value: "gemma-7b-it", label: "Gemma 7B IT" },
        
        // Specialized models
        { value: "llama-4-scout", label: "Llama 4 Scout (Tool Use)" },
        { value: "kimi-k2", label: "Kimi K2 (Long-form)" },
        { value: "llama-4-maverick", label: "Llama 4 Maverick (Vision)" },
      ];
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>EduQuill Lite</h1>
          <p style={styles.subtitle}>
            AI-powered learning companion – RAG demo (Qwen2.5-14B Instruct)
          </p>
        </div>
      </header>

      {error && (
        <div style={styles.error}>
          <strong>Oops:</strong> {error}
        </div>
      )}

      <main style={styles.main}>
        {/* Left column: upload + ask */}
        <div style={styles.leftColumn}>
          {/* Upload card */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>1. Upload course material</h2>
            <p style={styles.cardText}>
              Upload syllabi, notes, or PDFs. EduQuill will use them as context
              for answers.
            </p>
            <div style={styles.fieldRow}>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <span style={styles.fileName}>
                  Selected: <strong>{file.name}</strong>
                </span>
              )}
            </div>
            <button
              style={{
                ...styles.button,
                ...(isUploading ? styles.buttonDisabled : {}),
              }}
              onClick={uploadDoc}
              disabled={isUploading}
            >
              {isUploading ? "Uploading…" : "Upload & Index"}
            </button>
          </section>

          {/* Ask card */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>2. Configure & Ask EduQuill</h2>
            <p style={styles.cardText}>
              Choose your provider and model, then ask in any language.
            </p>
            
            {/* Provider and Model Selection */}
            <div style={styles.configRow}>
              <div style={styles.selectGroup}>
                <label style={styles.label}>Provider:</label>
                <select
                  value={providerType}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    setProviderType(newProvider);
                    // Reset model to first available when switching provider
                    const models = newProvider === "ollama" 
                      ? [
                          { value: "qwen2.5:14b-instruct", label: "Qwen 2.5 14B Instruct" },
                          { value: "llama3", label: "Llama 3" },
                          { value: "llama3.2", label: "Llama 3.2" },
                          { value: "mistral", label: "Mistral" },
                          { value: "mixtral", label: "Mixtral" },
                          { value: "qwen2.5:14b-instruct", label: "Qwen 2.5" },
                          { value: "phi3", label: "Phi-3" },
                        ]
                      : [
                          // Premium / Gold models
                          { value: "openai/gpt-oss-120b", label: "GPT OSS 120B ⭐ (Best Quality)" },
                          { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
                          { value: "qwen-3-32b", label: "Qwen 3 32B (Multilingual)" },
                          
                          // Standard models
                          { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
                          { value: "openai/gpt-oss-20b", label: "GPT OSS 20B (Fast & Efficient)" },
                          { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
                          { value: "gemma-7b-it", label: "Gemma 7B IT" },
                          
                          // Specialized models
                          { value: "llama-4-scout", label: "Llama 4 Scout (Tool Use)" },
                          { value: "kimi-k2", label: "Kimi K2 (Long-form)" },
                          { value: "llama-4-maverick", label: "Llama 4 Maverick (Vision)" },
                        ];
                    setModel(models[0].value);
                  }}
                  style={styles.select}
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="groq">Groq (API)</option>
                </select>
              </div>
              
              <div style={styles.selectGroup}>
                <label style={styles.label}>Model:</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={styles.select}
                >
                  {getAvailableModels().map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* API Key input (only for Groq) */}
            {providerType === "groq" && (
              <div style={styles.apiKeyGroup}>
                <label style={styles.label}>Groq API Key:</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Groq API key (or leave empty to use env var)"
                  style={styles.apiKeyInput}
                />
                <p style={styles.apiKeyHint}>
                  Get your API key from{" "}
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    console.groq.com
                  </a>
                </p>
              </div>
            )}
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              placeholder="Example: Explain the main topics that will be on the midterm and help me build a revision plan."
              style={styles.textarea}
            />
            <div style={styles.actionsRow}>
              <button
                style={{
                  ...styles.buttonPrimary,
                  ...(isAsking ? styles.buttonDisabled : {}),
                }}
                onClick={ask}
                disabled={isAsking}
              >
                {isAsking ? "Thinking…" : "Ask EduQuill"}
              </button>
              <span style={styles.hintText}>
                Session ID: <code>demo-student-1</code> (conversation memory
                enabled)
              </span>
            </div>
          </section>
        </div>

        {/* Right column: answer + sources */}
        <div style={styles.rightColumn}>
          {/* Answer card */}
          <section style={styles.cardLarge}>
            <h2 style={styles.cardTitle}>Tutor answer</h2>
            {!answer && !isAsking && (
              <p style={styles.muted}>
                Ask a question to see EduQuill&apos;s response here.
              </p>
            )}
            {isAsking && (
              <p style={styles.muted}>Generating a structured answer…</p>
            )}
            {answer && (
              <div style={styles.answerBox}>
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            )}
          </section>

          {/* Sources card */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Context sources</h2>
            {sources.length === 0 ? (
              <p style={styles.muted}>
                No sources yet. Upload a document and ask a question.
              </p>
            ) : (
              <ol style={styles.sourcesList}>
                {sources.map((s, i) => (
                  <li key={i} style={styles.sourceItem}>
                    <div style={styles.sourceHeader}>
                      <div>
                        <strong>{s.title || `Source ${i + 1}`}</strong>
                        <span style={styles.sourceMeta}>
                          {" "}
                          • chunk {s.chunk_index}
                        </span>
                      </div>
                      <span style={styles.scoreBadge}>
                        score {Number(s.score).toFixed(3)}
                      </span>
                    </div>
                    <details style={styles.details}>
                      <summary style={styles.summary}>View retrieved text</summary>
                      <p style={styles.sourceText}>{s.text}</p>
                    </details>
                  </li>
                ))}
              </ol>
            )}
            <p style={styles.mutedSmall}>
              EduQuill&apos;s answer may refer to these as{" "}
              <code>(Source 1)</code>, <code>(Source 2)</code>, etc.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

/* Simple inline style objects (no CSS file needed) */
const styles = {
  app: {
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: "#0f172a",
    color: "#e5e7eb",
    padding: "24px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: "0.9rem",
    color: "#9ca3af",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
    gap: "20px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    background: "rgba(15, 23, 42, 0.9)",
    borderRadius: "16px",
    padding: "16px 18px",
    boxShadow: "0 10px 40px rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
  },
  cardLarge: {
    background: "rgba(15, 23, 42, 0.95)",
    borderRadius: "16px",
    padding: "18px 20px",
    boxShadow: "0 12px 50px rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    minHeight: "220px",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: "1.05rem",
  },
  cardText: {
    margin: "0 0 12px",
    fontSize: "0.9rem",
    color: "#9ca3af",
  },
  fieldRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  fileName: {
    fontSize: "0.85rem",
    color: "#9ca3af",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "12px",
    padding: "10px 12px",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    background: "#020617",
    color: "#e5e7eb",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "0.95rem",
  },
  actionsRow: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "space-between",
  },
  button: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    background:
      "linear-gradient(135deg, rgba(148,163,184,0.9), rgba(148,163,184,0.6))",
    color: "#020617",
    fontWeight: 500,
  },
  buttonPrimary: {
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    background:
      "linear-gradient(135deg, rgba(59,130,246,1), rgba(56,189,248,1))",
    color: "#0b1120",
    fontWeight: 600,
    boxShadow: "0 10px 25px rgba(59,130,246,0.4)",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "default",
    boxShadow: "none",
  },
  hintText: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  answerBox: {
    marginTop: "8px",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "#020617",
    border: "1px solid rgba(148, 163, 184, 0.5)",
    maxHeight: "380px",
    overflowY: "auto",
    fontSize: "0.95rem",
  },
  muted: {
    fontSize: "0.9rem",
    color: "#9ca3af",
  },
  mutedSmall: {
    marginTop: "8px",
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  sourcesList: {
    margin: "8px 0 0",
    paddingLeft: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sourceItem: {
    fontSize: "0.85rem",
  },
  sourceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "6px",
  },
  sourceMeta: {
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  scoreBadge: {
    fontSize: "0.75rem",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(56, 189, 248, 0.7)",
    color: "#7dd3fc",
  },
  details: {
    marginTop: "4px",
  },
  summary: {
    cursor: "pointer",
    color: "#93c5fd",
  },
  sourceText: {
    marginTop: "4px",
    background: "#020617",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    whiteSpace: "pre-wrap",
  },
  error: {
    marginBottom: "12px",
    padding: "8px 10px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.5)",
    color: "#fecaca",
    fontSize: "0.85rem",
  },
  configRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  selectGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: "1",
    minWidth: "150px",
  },
  label: {
    fontSize: "0.85rem",
    color: "#9ca3af",
    fontWeight: 500,
  },
  select: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  apiKeyGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  },
  apiKeyInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    background: "#020617",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  apiKeyHint: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: "2px 0 0",
  },
  link: {
    color: "#7dd3fc",
    textDecoration: "none",
  },
};

export default App;
