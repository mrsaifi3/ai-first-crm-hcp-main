import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "http://localhost:8000";

const COLORS = { Positive: "#32d74b", Neutral: "#ff9f0a", Negative: "#ff453a" };
const TYPE_COLORS = { Meeting: "#0a84ff", Call: "#af52de", Email: "#ff9f0a" };
const AVATAR_COLORS = ["#0a84ff", "#32d74b", "#ff9f0a", "#ff453a", "#af52de", "#ffcc00"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", emoji: "🌅" };
  if (h < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (h < 21) return { text: "Good Evening", emoji: "🌆" };
  return { text: "Good Night", emoji: "🌙" };
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const steps = 20;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplay(Math.round((value / steps) * i));
      if (i >= steps) { clearInterval(timer); setDisplay(value); }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

function InitialsAvatar({ name, index }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="dash-avatar" style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const greeting = getGreeting();

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch(`${API_URL}/interactions?page=1&page_size=5`)
      .then((r) => r.json())
      .then((d) => setRecent(d.items || []))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const sentimentData = Object.entries(stats.by_sentiment || {}).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(stats.by_type || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{greeting.emoji} {greeting.text}</h2>
        <p className="dashboard-subtitle">Here&apos;s what&apos;s happening with your HCP interactions</p>
      </div>

      <div className="dashboard-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon blue">📊</div>
          <div>
            <span className="dash-stat-value"><AnimatedNumber value={stats.total} /></span>
            <span className="dash-stat-label">Total Interactions</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon green">📅</div>
          <div>
            <span className="dash-stat-value"><AnimatedNumber value={stats.weekly} /></span>
            <span className="dash-stat-label">This Week</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon purple">📋</div>
          <div>
            <span className="dash-stat-value">{Object.keys(stats.by_type || {}).length}</span>
            <span className="dash-stat-label">Interaction Types</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon orange">👤</div>
          <div>
            <span className="dash-stat-value">{(stats.top_hcps || []).length}</span>
            <span className="dash-stat-label">Active HCPs</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="dash-chart-card">
          <h3>Sentiment Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {sentimentData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#8e8e93"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-legend">
            {sentimentData.map((d) => (
              <span key={d.name} className="dash-legend-item">
                <span className="dash-dot" style={{ background: COLORS[d.name] || "#8e8e93" }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="dash-chart-card">
          <h3>By Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: "#8e8e93", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} stroke="none">
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || "#8e8e93"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="dash-legend">
            {typeData.map((d) => (
              <span key={d.name} className="dash-legend-item">
                <span className="dash-dot" style={{ background: TYPE_COLORS[d.name] || "#8e8e93" }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="dash-chart-card dash-half">
          <h3>🏆 Top HCPs</h3>
          {(stats.top_hcps || []).length === 0 ? (
            <p className="dash-empty">No interactions yet</p>
          ) : (
            <div className="dash-hcps">
              {stats.top_hcps.map((h, i) => (
                <div key={h.name} className="dash-hcp-row">
                  <InitialsAvatar name={h.name} index={i} />
                  <span className="dash-hcp-name">{h.name}</span>
                  <span className="dash-hcp-count">{h.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-chart-card dash-half">
          <h3>⚡ Recent Activity</h3>
          {recent.length === 0 ? (
            <p className="dash-empty">No recent activity</p>
          ) : (
            <div className="dash-activity">
              {recent.map((item) => (
                <div key={item.id} className="dash-activity-row">
                  <span className="dash-activity-dot" style={{ background: COLORS[item.sentiment] || "#8e8e93" }} />
                  <span className="dash-activity-name">{item.hcpName}</span>
                  <span className="dash-activity-type">{item.interactionType}</span>
                  <span className="dash-activity-date">{item.date || item.created_at?.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
