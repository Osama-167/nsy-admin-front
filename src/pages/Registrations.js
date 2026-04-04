import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const STATUS_OPTIONS = ["", "new", "reviewed", "accepted", "rejected"];

export default function Registrations() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const filteredCount = useMemo(() => list.length, [list]);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const res = await api.getRegistrations(status);

      // res expected: { ok, data: [...] }
      setList(res?.data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id, nextStatus) {
    try {
      setActionLoadingId(id);
      const res = await api.updateRegistrationStatus(id, nextStatus);
      if (res?.ok === false) throw new Error(res?.message || "Update failed");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoadingId("");
    }
  }

  async function remove(id) {
    const ok = window.confirm("Delete this registration?");
    if (!ok) return;

    try {
      setActionLoadingId(id);
      const res = await api.deleteRegistration(id);
      if (res?.ok === false) throw new Error(res?.message || "Delete failed");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <div>
      <div className="row between">
        <h1 className="h1">Registrations</h1>

        <div className="row gap">
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "All" : s}
              </option>
            ))}
          </select>

          <button className="btn" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading...</div>
      ) : err ? (
        <div className="danger">❌ {err}</div>
      ) : (
        <div className="muted" style={{ marginBottom: 10 }}>
          Showing: <b>{filteredCount}</b>
        </div>
      )}

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>University</th>
              <th>Track</th>
              <th>Status</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && !err && list.length === 0 ? (
              <tr>
                <td colSpan="6" className="muted" style={{ padding: 16 }}>
                  No registrations yet.
                </td>
              </tr>
            ) : (
              list.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="tdTitle">{r.fullName}</div>
                    <div className="muted small">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                    </div>
                  </td>

                  <td>
                    <div className="muted small">{r.email || "-"}</div>
                    <div className="muted small">{r.phone || "-"}</div>
                  </td>

                  <td>
                    <div className="muted small">{r.university || "-"}</div>
                    <div className="muted small">{r.faculty || "-"}</div>
                    <div className="muted small">{r.levelOrYear || "-"}</div>
                  </td>

                  <td className="muted small">{r.track || "-"}</td>

                  <td>
                    <span className={`badge ${r.status || ""}`}>{r.status || "-"}</span>
                  </td>

                  <td>
                    <div className="row gap wrap">
                      <button
                        className="btnSmall"
                        disabled={actionLoadingId === r._id}
                        onClick={() => updateStatus(r._id, "reviewed")}
                      >
                        Reviewed
                      </button>

                      <button
                        className="btnSmall ok"
                        disabled={actionLoadingId === r._id}
                        onClick={() => updateStatus(r._id, "accepted")}
                      >
                        Accept
                      </button>

                      <button
                        className="btnSmall danger"
                        disabled={actionLoadingId === r._id}
                        onClick={() => updateStatus(r._id, "rejected")}
                      >
                        Reject
                      </button>

                      <button
                        className="btnSmall ghost"
                        disabled={actionLoadingId === r._id}
                        onClick={() => remove(r._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
