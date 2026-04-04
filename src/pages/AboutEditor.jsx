import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function AboutEditor() {
  const [content, setContent] = useState(null);
  const [about, setAbout] = useState({ title: "", imageUrl: "", paragraphs: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .getContent()
      .then((res) => {
        if (!mounted) return;
        setContent(res.data);
        setAbout(res.data?.about || { title: "", imageUrl: "", paragraphs: [] });
      })
      .catch((e) => mounted && setErr(e.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  function updatePara(i, v) {
    setAbout((p) => ({
      ...p,
      paragraphs: (p.paragraphs || []).map((x, idx) => (idx === i ? v : x)),
    }));
  }

  function addPara() {
    setAbout((p) => ({ ...p, paragraphs: [...(p.paragraphs || []), ""] }));
  }

  function removePara(i) {
    if (!window.confirm("Delete paragraph?")) return;
    setAbout((p) => ({
      ...p,
      paragraphs: (p.paragraphs || []).filter((_, idx) => idx !== i),
    }));
  }

  async function save() {
    try {
      setSaving(true);
      setErr("");

      const payload = {
        ...content,
        about: {
          title: (about.title || "").trim(),
          imageUrl: (about.imageUrl || "").trim(), // optional
          paragraphs: (about.paragraphs || []).map((x) => (x || "").trim()).filter(Boolean),
        },
      };

      const res = await api.updateContent(payload);
      setContent(res.data);
      alert("✅ About updated");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;
  if (err) return <div className="danger">❌ {err}</div>;

  return (
    <div>
      <div className="row between">
        <h1 className="h1">About Editor</h1>
        <button className="btn ok" disabled={saving} onClick={save}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="card">
        <div className="field">
          <label>Title</label>
          <input
            value={about.title || ""}
            onChange={(e) => setAbout({ ...about, title: e.target.value })}
            placeholder="About Us"
          />
        </div>

        {/* ✅ No upload - only optional URL */}
        {/* <div className="field">
          <label>Image URL (optional)</label>
          <input
            value={about.imageUrl || ""}
            onChange={(e) => setAbout({ ...about, imageUrl: e.target.value })}
            placeholder="https://... or leave empty"
          />
        </div> */}

        <div className="field">
          <label>Paragraphs</label>

          {(about.paragraphs || []).map((p, i) => (
            <div key={i} className="row gap" style={{ alignItems: "flex-start" }}>
              <textarea
                rows={3}
                value={p}
                onChange={(e) => updatePara(i, e.target.value)}
                placeholder={`Paragraph ${i + 1}`}
              />
              <button className="btnSmall danger" onClick={() => removePara(i)}>
                Delete
              </button>
            </div>
          ))}

          <button className="btnSmall" onClick={addPara}>
            + Add Paragraph
          </button>
        </div>
      </div>
    </div>
  );
}
