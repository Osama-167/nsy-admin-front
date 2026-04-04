import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function HeroEditor() {
  const [content, setContent] = useState(null);
  const [hero, setHero] = useState({ title: "", subtitle: "", imageUrl: "" });
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
        setHero(res.data?.hero || { title: "", subtitle: "", imageUrl: "" });
      })
      .catch((e) => mounted && setErr(e.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    try {
      setSaving(true);
      setErr("");

      const payload = {
        ...content,
        hero: {
          title: (hero.title || "").trim(),
          subtitle: (hero.subtitle || "").trim(),
          imageUrl: (hero.imageUrl || "").trim(), // optional
        },
      };

      const res = await api.updateContent(payload);
      setContent(res.data);
      alert("✅ Hero updated");
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
        <h1 className="h1">Hero Editor</h1>
        <button className="btn ok" disabled={saving} onClick={save}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="card">
        <div className="field">
          <label>Title</label>
          <input
            value={hero.title || ""}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            placeholder="NANO SATELLITE YARD"
          />
        </div>

        <div className="field">
          <label>Subtitle</label>
          <input
            value={hero.subtitle || ""}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            placeholder="A tiny box that enhances our vision of the Earth."
          />
        </div>

        {/* ✅ No upload - only optional URL */}
        {/* <div className="field">
          <label>Image URL (optional)</label>
          <input
            value={hero.imageUrl || ""}
            onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
            placeholder="https://... or leave empty"
          />
        </div> */}
      </div>
    </div>
  );
}
