import { useEffect, useState, useDeferredValue } from "react";

export default function SearchFilters({ searchIndex }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const [initialized, setInitialized] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    const initialType = params.get("type");

    if (initialQuery) setQuery(initialQuery);
    if (initialType === "Review" || initialType === "Boss Feature") {
      setKind(initialType);
    }

    setInitialized(true);
  }, []);

  const results = searchIndex.filter((entry) => {
    const q = deferredQuery.trim().toLowerCase();
    const kindMatches = kind === "All" || entry.type === kind;
    if (!kindMatches) return false;
    if (!q) return true;
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.blurb.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams(window.location.search);

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    if (kind !== "All") {
      params.set("type", kind);
    } else {
      params.delete("type");
    }

    const next = params.toString();
    const nextUrl = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [query, kind, initialized]);

  return (
    <section>
      <div className="search-bar">
        <span className="search-bar-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor"></circle>
            <path d="M20 20L16.65 16.65" stroke="currentColor" strokeLinecap="round"></path>
          </svg>
        </span>
        <input
          className="search-bar-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or description..."
          aria-label="Search content"
          autoFocus
        />
      </div>

      <div className="search-toolbar" aria-label="Filter search results">
        <div className="search-filter-group" role="group" aria-label="Content type">
          {["All", "Review", "Boss Feature"].map((option) => (
            <button
              key={option}
              type="button"
              className={`search-filter-btn${kind === option ? " is-active" : ""}`}
              onClick={() => setKind(option)}
            >
              {option === "All" ? "All" : option === "Review" ? "Reviews" : "Boss Features"}
            </button>
          ))}
        </div>
      </div>

      <p className="search-meta">
        {query.trim()
          ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query.trim()}"`
          : `Showing ${results.length} archived item${results.length === 1 ? "" : "s"}`}
      </p>

      {results.length > 0 ? (
        <div className="search-results">
          {results.map((entry) => (
            <a key={entry.url} href={entry.url} className="search-result">
              <div>
                <div className="result-type">{entry.type}</div>
                <h2 className="result-title">{entry.title}</h2>
                <p className="result-desc">{entry.blurb || entry.description}</p>
              </div>
              <div className="result-date">{entry.date}</div>
            </a>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="search-empty">
          <h2 className="search-empty-heading">No matches</h2>
          <p className="search-empty-text">Try a broader title, a character name, or switch the filter.</p>
        </div>
      ) : (
        <div className="search-prompt">
          <p className="search-prompt-text">Start typing to scan reviews and boss features.</p>
        </div>
      )}
    </section>
  );
}
