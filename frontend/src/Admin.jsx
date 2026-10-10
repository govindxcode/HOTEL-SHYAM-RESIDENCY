import { useCallback, useEffect, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function Admin({ theme, onToggleTheme }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`${API}/api/bookings`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load bookings.");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchStatus = async (id, status) => {
    setBusy(id + status);
    setError("");
    try {
      const response = await fetch(`${API}/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed.");
      setRows((prev) => prev.map((row) => (row._id === id ? data : row)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="admin">
      <header className="admin-bar">
        <a className="brand" href="/">
          <span className="brand-mark">SR</span>
          <span>
            Staff desk
            <small>Bookings · no login yet</small>
          </span>
        </a>
        <div className="nav-end">
          <button className="ghost" type="button" onClick={onToggleTheme}>
            {theme === "dark" ? "Day" : "Night"}
          </button>
          <button className="pill" type="button" onClick={load}>
            Refresh
          </button>
        </div>
      </header>

      <section className="admin-body">
        <h1>Enquiries</h1>
        {error && <p className="form-note error">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Guest</th>
                <th>Stay</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5">No enquiries yet.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                  <td>
                    <strong>{row.name}</strong>
                    <div>{row.phone}</div>
                    {row.message ? <div className="msg">{row.message}</div> : null}
                  </td>
                  <td>
                    {row.checkIn} → {row.checkOut}
                    <div>{row.guests} guests</div>
                  </td>
                  <td>{row.roomType}</td>
                  <td>
                    <div className="status-row">
                      {["Pending", "Confirmed", "Cancelled"].map((state) => (
                        <button
                          key={state}
                          type="button"
                          className={`status ${row.status === state ? "on" : ""} ${state.toLowerCase()}`}
                          disabled={busy === row._id + state}
                          onClick={() => patchStatus(row._id, state)}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
