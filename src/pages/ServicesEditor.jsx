import React, { useEffect, useState } from "react";
import { api } from "../api";

const emptyItem = () => ({
  id: "",
  title: "",
  imageUrl: "",
  fullText: "",
  moreContent: "",
});

export default function ServicesEditor() {
  const [items, setItems] = useState([]);
  const [servicesMeta, setServicesMeta] = useState({ title: "Our Services", caption: "" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(""); // index
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        setOk("");

        const res = await api.getContent(); // { ok, data }
        const doc = res?.data || {};

        const s = doc.services || {};
        const list = Array.isArray(s.items) ? s.items : [];

        if (mounted) {
          setServicesMeta({
            title: s.title || "Our Services",
            caption: s.caption || "",
          });
          setItems(list.length ? list : [emptyItem()]);
        }
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load services");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  function updateItem(i, patch) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    setItems((p) => [...p, emptyItem()]);
  }

  function removeItem(i) {
    if (!window.confirm("Delete this service?")) return;
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  async function upload(i, file) {
    if (!file) return;
    try {
      setErr("");
      setOk("");
      setUploadingKey(String(i));

      const res = await api.uploadImage(file); // { ok, url, public_id }
      if (!res?.ok) throw new Error(res?.message || "Upload failed");
      if (!res?.url) throw new Error("Upload returned no url");

      updateItem(i, { imageUrl: res.url });
      setOk("✅ Image uploaded");
    } catch (e) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploadingKey("");
    }
  }

  async function saveAll() {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      const cleaned = (items || []).map((it) => ({
        id: (it.id || "").trim(),
        title: (it.title || "").trim(),
        imageUrl: (it.imageUrl || "").trim(),
        fullText: (it.fullText || "").trim(),
        moreContent: (it.moreContent || "").trim(),
      }));

      const payload = {
        services: {
          title: (servicesMeta.title || "").trim() || "Our Services",
          caption: (servicesMeta.caption || "").trim(),
          items: cleaned,
        },
      };

      const res = await api.updateContent(payload);
      if (!res?.ok) throw new Error(res?.message || "Save failed");

      setOk("✅ Services updated");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div>
      <div className="row between">
        <h1 className="h1">Services Editor</h1>
        <div className="row gap">
          <button className="btn" onClick={addItem}>
            + Add Service
          </button>
          <button className="btn ok" disabled={saving} onClick={saveAll}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {err ? <div className="alert error">❌ {err}</div> : null}
      {ok ? <div className="alert ok">{ok}</div> : null}

      {/* title/caption */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="field">
          <label>Section Title</label>
          <input
            value={servicesMeta.title}
            onChange={(e) => setServicesMeta((p) => ({ ...p, title: e.target.value }))}
            placeholder="Our Services"
          />
        </div>
        <div className="field">
          <label>Caption</label>
          <input
            value={servicesMeta.caption}
            onChange={(e) => setServicesMeta((p) => ({ ...p, caption: e.target.value }))}
            placeholder="Check out our amazing services."
          />
        </div>
      </div>

      <div className="grid">
        {items.map((it, i) => {
          const uploading = uploadingKey === String(i);

          return (
            <div className="card" key={i}>
              <div className="row between">
                <strong>Service #{i + 1}</strong>
                <button className="btnSmall danger" onClick={() => removeItem(i)}>
                  Delete
                </button>
              </div>

              <div className="field">
                <label>ID (for scroll)</label>
                <input
                  value={it.id}
                  onChange={(e) => updateItem(i, { id: e.target.value })}
                  placeholder="development / training / solar-energy"
                />
              </div>

              <div className="field">
                <label>Title</label>
                <input
                  value={it.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="Solar energy"
                />
              </div>

              <div className="field">
                <label>Image</label>

                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt=""
                    style={{ width: "100%", borderRadius: 10, marginBottom: 8 }}
                  />
                ) : null}

                <label className="btn" style={{ display: "inline-block", cursor: "pointer" }}>
                  {uploading ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => e.target.files && upload(i, e.target.files[0])}
                  />
                </label>
              </div>

              <div className="field">
                <label>Full Text</label>
                <textarea
                  rows={4}
                  value={it.fullText}
                  onChange={(e) => updateItem(i, { fullText: e.target.value })}
                />
              </div>

              <div className="field">
                <label>More Content (optional)</label>
                <textarea
                  rows={3}
                  value={it.moreContent}
                  onChange={(e) => updateItem(i, { moreContent: e.target.value })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
