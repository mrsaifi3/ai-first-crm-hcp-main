import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { fetchInteractions } from "../services/interactionApi";
import toast from "react-hot-toast";

function getStartOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(val) {
  if (!val) return "-";
  const lower = val.toLowerCase().trim();
  const today = new Date();
  if (lower === "today") return today.toISOString().split("T")[0];
  if (lower === "tomorrow" || lower === "tom") {
    const d = new Date(today); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (lower === "yesterday" || lower === "yest") {
    const d = new Date(today); d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }
  return val;
}

export default function InteractionList() {
  const [interactions, setInteractions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [weekFilter, setWeekFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const sortRef = useRef(null);
  const listRefresh = useSelector((state) => state.interaction.listRefresh);
  const searchTimer = useRef(null);

  const loadInteractions = useCallback(async (p, q) => {
    setLoading(true);
    try {
      const data = await fetchInteractions(p, pageSize, q);
      setInteractions(data.items || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadInteractions(page, search);
  }, [page, search, listRefresh, loadInteractions]);

  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val.trim().toLowerCase());
      setPage(1);
    }, 300);
  };

  const handleSort = (field, order) => {
    if (sortField === field && sortOrder === order) {
      setSortField(null);
      setSortOrder("desc");
      setWeekFilter(false);
    } else {
      setSortField(field);
      setSortOrder(order);
      if (field === "week") setWeekFilter(true);
      else setWeekFilter(false);
    }
    setSortOpen(false);
  };

  const sortOptions = [
    { field: "time", order: "asc", label: "Time", icon: "\u2191" },
    { field: "time", order: "desc", label: "Time", icon: "\u2193" },
    { field: "date", order: "asc", label: "Date", icon: "\u2191" },
    { field: "date", order: "desc", label: "Date", icon: "\u2193" },
    { field: "week", order: "desc", label: "This Week", icon: "" },
  ];

  const getActive = (field) => sortOptions.find((o) => o.field === field && o.field === sortField);
  const activeSort = sortOptions.find((o) => o.field === sortField && o.order === sortOrder);
  const activeLabel = activeSort ? `${activeSort.label} ${activeSort.icon}` : "Sort";

  const filtered = useMemo(() => {
    let result = interactions;
    if (weekFilter) {
      const now = new Date();
      const todayStart = getStartOfDay(now);
      const weekAgo = new Date(todayStart);
      weekAgo.setDate(weekAgo.getDate() - 6);
      result = result.filter((i) => {
        if (!i.date) return false;
        const d = new Date(i.date.replace(/-/g, "/"));
        if (isNaN(d.getTime())) return false;
        const ds = getStartOfDay(d);
        return ds >= weekAgo && ds <= todayStart;
      });
    }
    if (sortField && sortField !== "week") {
      result = result.sort((a, b) => {
        let va, vb;
        if (sortField === "time") {
          va = a.time || "";
          vb = b.time || "";
          if (!va && !vb) return 0;
          if (!va) return 1;
          if (!vb) return -1;
        } else {
          va = a.date || "";
          vb = b.date || "";
          if (!va && !vb) return 0;
          if (!va) return 1;
          if (!vb) return -1;
          if (va === vb) {
            const ta = a.time || "00:00";
            const tb = b.time || "00:00";
            return sortOrder === "asc" ? ta.localeCompare(tb) : tb.localeCompare(ta);
          }
        }
        return sortOrder === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return result;
  }, [interactions, sortField, sortOrder, weekFilter]);

  const exportCSV = () => {
    if (interactions.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["HCP Name", "Type", "Date", "Time", "Topics", "Sentiment", "Outcomes"];
    const rows = interactions.map((i) => [
      i.hcpName,
      i.interactionType || "Meeting",
      i.date || "",
      i.time || "",
      `"${(i.topics || "").replace(/"/g, '""')}"`,
      i.sentiment || "",
      `"${(i.outcomes || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <>
      <div className="list-toolbar">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by HCP, topic, type, sentiment..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}>&times;</button>
          )}
        </div>
        <div className="sort-dropdown" ref={sortRef}>
          <button className="sort-btn ripple-btn dark-ripple" onClick={() => setSortOpen((p) => !p)}>
            <span className="sort-btn-label">{activeLabel}</span>
            <svg className="sort-btn-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {sortOpen && (
            <div className="sort-menu">
              <div className="sort-menu-header">Sort by</div>
              {["time", "date"].map((field) => {
                const active = getActive(field);
                const isActive = sortField === field;
                return (
                  <div key={field} className="sort-field-row">
                    <span className="sort-field-label">{field === "time" ? "Time" : "Date"}</span>
                    <div className="sort-order-group">
                      <button
                        className={`sort-order-btn ${isActive && sortOrder === "asc" ? "active" : ""}`}
                        onClick={() => handleSort(field, "asc")}
                        title="Ascending"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2.5V9.5M6 9.5L3 6.5M6 9.5L9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className={`sort-order-btn ${isActive && sortOrder === "desc" ? "active" : ""}`}
                        onClick={() => handleSort(field, "desc")}
                        title="Descending"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 9.5V2.5M6 2.5L3 5.5M6 2.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="sort-menu-divider" />
              <button
                className={`sort-option ${sortField === "week" ? "active" : ""}`}
                onClick={() => handleSort("week", "desc")}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: 8, flexShrink: 0}}>
                  <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4.5 1V3.5M9.5 1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                This Week
              </button>
            </div>
          )}
        </div>
        <button className="export-btn ripple-btn dark-ripple" onClick={exportCSV}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 10L3 11.5C3 11.7761 3.22386 12 3.5 12L10.5 12C10.7761 12 11 11.7761 11 11.5L11 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M7 2L7 8M7 8L4.5 5.5M7 8L9.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
        {total > 0 && !loading && (
          <span className="filter-count">{filtered.length} / {total}</span>
        )}
        {loading && <span className="filter-count" style={{ color: "var(--label-tertiary)" }}>Loading...</span>}
      </div>

      {loading && interactions.length === 0 ? (
        <div className="empty-state">
          <div className="dashboard-spinner" />
          <p>Loading interactions...</p>
        </div>
      ) : interactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
              <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 18H42" stroke="currentColor" strokeWidth="2"/>
              <path d="M18 26H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 32H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>No interactions logged yet</h3>
          <p>Start by filling the form or using the AI chat assistant.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: "20px" }}>
          <p>No results found for selected filters.</p>
        </div>
      ) : (
        <>
          <table className="interactions-table">
            <thead>
              <tr>
                <th>HCP Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Topics</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.hcpName}</strong></td>
                  <td><span className="interaction-type-badge">{item.interactionType || "Meeting"}</span></td>
                  <td className="interaction-date">{formatDate(item.date)}</td>
                  <td className="interaction-time">{item.time || "-"}</td>
                  <td className="interaction-topics">{item.topics || "-"}</td>
                  <td>
                    {item.sentiment && (
                      <span className={`sentiment-badge ${item.sentiment}`}>
                        {item.sentiment}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="sort-btn ripple-btn dark-ripple" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button className="sort-btn ripple-btn dark-ripple" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
