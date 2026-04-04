import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.health();
        if (mounted) setHealth(res);
      } catch (e) {
        if (mounted) setErr(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="h1">Dashboard</h1>

      <div className="grid">
        <div className="card">
          <h3 className="cardTitle">Backend Status</h3>

          {loading ? (
            <div className="muted">Checking...</div>
          ) : err ? (
            <div className="danger">❌ {err}</div>
          ) : (
            <div className="success">
              ✅ {health?.message || "Backend is running"}
            </div>
          )}

          <div className="muted" style={{ marginTop: 10 }}>
            Endpoint: <code>/api/health</code>
          </div>
        </div>

        <div className="card">
          <h3 className="cardTitle">Next Step</h3>
          <div className="muted">
            Open <b>Registrations</b> to review applicants and update their status.
          </div>
        </div>
      </div>
    </div>
  );
}
