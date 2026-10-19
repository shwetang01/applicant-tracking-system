import { useEffect, useState, useCallback } from "react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";
const STAGES = ["Sourced", "Shortlisted", "Screening", "Interview", "Offer", "Joined", "Rejected"];
const empty = { name: "", email: "", phone: "", position: "", skills: "", notes: "", stage: "Sourced" };

async function call(path, opts) {
  const token = localStorage.getItem("token");
  const r = await fetch(API + path, {
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    ...opts,
  });
  if (r.status === 401 && token) { localStorage.removeItem("token"); location.reload(); }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.status === 204 ? null : r.json();
}

const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const hue = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const ago = (d) => {
  const m = (Date.now() - new Date(d)) / 6e4;
  return m < 60 ? `${Math.max(1, Math.round(m))}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`;
};
const Avatar = ({ name }) => <span className="avatar" style={{ background: `hsl(${hue(name)} 70% 45%)` }}>{initials(name)}</span>;

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const logout = () => { localStorage.removeItem("token"); setAuthed(false); };
  return authed ? <Ats logout={logout} /> : <Login onAuth={() => setAuthed(true)} />;
}

function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { token } = await call(`/auth/${signup ? "register" : "login"}`, { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("token", token);
      onAuth();
    } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <div className="login">
      <div className="hero">
        <div className="logo">EarlyJobs<span>.ai</span></div>
        <h1>Hire your ideal team.<br />10X quicker.</h1>
        <p>Recruiter-first hiring. Track every candidate from sourced to joined, and keep people at the centre of every decision.</p>
      </div>
      <form onSubmit={submit} className="panel">
        <h2>{signup ? "Create recruiter account" : "Welcome back, recruiter"}</h2>
        {err && <p className="err">{err}</p>}
        <input type="email" placeholder="Work email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (6+ characters)" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Log in"}</button>
        <button type="button" className="link" onClick={() => { setSignup(!signup); setErr(""); }}>
          {signup ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}

function Ats({ logout }) {
  const [list, setList] = useState(null); // null = loading
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [view, setView] = useState(localStorage.getItem("view") || "board");
  const [drawer, setDrawer] = useState(null); // null | candidate | {} for new
  const [toast, setToast] = useState(null);
  const [over, setOver] = useState("");

  const say = (msg, bad) => { setToast({ msg, bad }); setTimeout(() => setToast(null), 2800); };

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ q, stage });
      const [l, s] = await Promise.all([call(`/candidates?${p}`), call("/stats")]);
      setList(l); setStats(s);
    } catch (e) { say(e.message, true); setList((x) => x || []); }
  }, [q, stage]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]); // debounce search
  useEffect(() => { localStorage.setItem("view", view); }, [view]);
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setDrawer(null);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);

  const move = async (id, s) => {
    const c = list.find((x) => x._id === id);
    if (!c || c.stage === s) return;
    setList(list.map((x) => (x._id === id ? { ...x, stage: s } : x))); // optimistic
    try { await call(`/candidates/${id}`, { method: "PUT", body: JSON.stringify({ stage: s }) }); say(`${c.name} → ${s}`); }
    catch (e) { say(e.message, true); }
    load();
  };

  const save = async (form, id) => {
    try {
      await call(id ? `/candidates/${id}` : "/candidates", { method: id ? "PUT" : "POST", body: JSON.stringify(form) });
      say(id ? "Candidate updated" : "Candidate added");
      setDrawer(null); load();
    } catch (e) { say(e.message, true); }
  };

  const del = async (c) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    try { await call(`/candidates/${c._id}`, { method: "DELETE" }); say("Candidate deleted"); setDrawer(null); load(); }
    catch (e) { say(e.message, true); }
  };

  const Card = ({ c }) => (
    <div className="ccard" draggable onDragStart={(e) => e.dataTransfer.setData("id", c._id)} onClick={() => setDrawer(c)}>
      <Avatar name={c.name} />
      <div className="cmeta">
        <b>{c.name}</b>
        <small>{c.position}</small>
        <div className="tags">{(c.skills || []).slice(0, 3).map((s) => <i key={s}>{s}</i>)}</div>
      </div>
      <small className="when">{ago(c.createdAt)}</small>
    </div>
  );

  const total = stats?.total || 0;

  return (
    <div className="app">
      <header>
        <div className="logo">EarlyJobs<span>.ai</span> <em>ATS</em></div>
        <button className="ghost" onClick={logout}>Log out</button>
      </header>

      <section className="stats">
        <div className="stat big"><b>{stats?.total ?? "–"}</b>Candidates</div>
        <div className="stat"><b>{stats?.joinRate ?? 0}%</b>Joining rate</div>
        <div className="stat"><b>{stats?.last7Days ?? 0}</b>New this week</div>
        <div className="stat wide">
          <small>Top mandates</small>
          {stats?.topPositions.length ? stats.topPositions.map((p) => <span key={p.position} className="pill">{p.position} · {p.n}</span>) : <span className="muted">None yet</span>}
        </div>
      </section>

      {total > 0 && (
        <div className="funnel" title="Pipeline mix">
          {STAGES.map((s) => stats.stages[s] > 0 && (
            <div key={s} className={"seg s-" + s} style={{ flex: stats.stages[s] }} onClick={() => setStage(stage === s ? "" : s)}>
              {s} {stats.stages[s]}
            </div>
          ))}
        </div>
      )}

      <div className="toolbar">
        <input className="search" placeholder="Search name, email, role or skill…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          <button className={!stage ? "chip on" : "chip"} onClick={() => setStage("")}>All</button>
          {STAGES.map((s) => <button key={s} className={stage === s ? "chip on" : "chip"} onClick={() => setStage(stage === s ? "" : s)}>{s}</button>)}
        </div>
        <div className="seg2">
          <button className={view === "board" ? "on" : ""} onClick={() => setView("board")}>Board</button>
          <button className={view === "list" ? "on" : ""} onClick={() => setView("list")}>List</button>
        </div>
        <button className="primary" onClick={() => setDrawer({})}>+ Add candidate</button>
      </div>

      {list === null ? (
        <div className="skeleton">{[1, 2, 3, 4].map((i) => <div key={i} />)}</div>
      ) : !list.length ? (
        <div className="empty">
          <h3>{q || stage ? "No matches" : "Your pipeline is empty"}</h3>
          <p>{q || stage ? "Try a different search or clear the filter." : "Add your first candidate to start tracking."}</p>
          {!(q || stage) && <button className="primary" onClick={() => setDrawer({})}>+ Add candidate</button>}
        </div>
      ) : view === "board" ? (
        <div className="board">
          {STAGES.filter((s) => !stage || s === stage).map((s) => {
            const items = list.filter((c) => c.stage === s);
            return (
              <div key={s} className={"col" + (over === s ? " over" : "")}
                onDragOver={(e) => { e.preventDefault(); setOver(s); }}
                onDragLeave={() => setOver("")}
                onDrop={(e) => { setOver(""); move(e.dataTransfer.getData("id"), s); }}>
                <h4><span className={"dot s-" + s} />{s}<em>{items.length}</em></h4>
                {items.map((c) => <Card key={c._id} c={c} />)}
                {!items.length && <p className="muted drop">Drop here</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <table>
          <thead><tr><th>Candidate</th><th>Mandate</th><th>Skills</th><th>Stage</th><th>Added</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} onClick={() => setDrawer(c)}>
                <td className="who"><Avatar name={c.name} /><div>{c.name}<br /><small>{c.email}</small></div></td>
                <td>{c.position}</td>
                <td>{(c.skills || []).join(", ")}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select className={"s-" + c.stage} value={c.stage} onChange={(e) => move(c._id, e.target.value)}>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><small>{ago(c.createdAt)}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {drawer && <Drawer c={drawer} onClose={() => setDrawer(null)} onSave={save} onDelete={del} />}
      {toast && <div className={"toast" + (toast.bad ? " bad" : "")}>{toast.msg}</div>}
    </div>
  );
}

function Drawer({ c, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...empty, ...c, skills: (c.skills || []).join(", ") });
  const f = (k) => ({ value: form[k] || "", onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  return (
    <div className="overlay" onClick={onClose}>
      <form className="drawer" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(form, c._id); }}>
        <div className="dhead">
          {c._id && <Avatar name={c.name} />}
          <h2>{c._id ? c.name : "Add candidate"}</h2>
          <button type="button" className="ghost" onClick={onClose}>✕</button>
        </div>
        {c._id && (
          <div className="steps">
            {STAGES.filter((s) => s !== "Rejected").map((s) => (
              <button type="button" key={s} className={"step" + (form.stage === s ? " on" : "")} onClick={() => setForm({ ...form, stage: s })}>{s}</button>
            ))}
            <button type="button" className={"step rej" + (form.stage === "Rejected" ? " on" : "")} onClick={() => setForm({ ...form, stage: "Rejected" })}>Rejected</button>
          </div>
        )}
        <label>Name<input required autoFocus {...f("name")} /></label>
        <label>Email<input type="email" required {...f("email")} /></label>
        <label>Phone<input {...f("phone")} /></label>
        <label>Mandate / role<input required {...f("position")} /></label>
        <label>Skills (comma separated)<input {...f("skills")} /></label>
        <label>Recruiter notes<textarea rows="4" {...f("notes")} /></label>
        <div className="actions">
          <button className="primary">{c._id ? "Save changes" : "Add candidate"}</button>
          {c._id && <button type="button" className="danger" onClick={() => onDelete(c)}>Delete</button>}
        </div>
        {c._id && <small className="muted">Added {ago(c.createdAt)} · updated {ago(c.updatedAt)}</small>}
      </form>
    </div>
  );
}
