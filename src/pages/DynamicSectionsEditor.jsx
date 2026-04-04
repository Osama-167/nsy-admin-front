import React, { useEffect, useState } from "react";
import { api } from "../api";

const emptyItem = () => ({
  id: "",
  title: "",
  imageUrl: "",
  fullText: "",
  moreContent: "",
});

const emptySection = () => ({
  enabled: true,
  sectionId: "",
  title: "",
  caption: "",
  items: [emptyItem()],
});

const sanitizeId = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "");

export default function DynamicSectionsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        setOk("");

        const res = await api.getContent(); // { ok, data }
        const doc = res?.data;

        const list = Array.isArray(doc?.dynamicSections)
          ? doc.dynamicSections
          : [];

        if (mounted) {
          setSections(list.length ? list : [emptySection()]);
        }
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Section actions ----------
  const addSection = () => setSections((p) => [...p, emptySection()]);

  const deleteSection = (si) => {
    const ok = window.confirm("Delete this section?");
    if (!ok) return;
    setSections((p) => p.filter((_, i) => i !== si));
  };

  const updateSectionField = (si, key, value) => {
    setSections((p) => {
      const copy = [...p];
      copy[si] = { ...copy[si], [key]: value };
      return copy;
    });
  };

  // ---------- Item actions ----------
  const addItem = (si) => {
    setSections((p) => {
      const copy = [...p];
      const s = copy[si];
      copy[si] = { ...s, items: [...(s.items || []), emptyItem()] };
      return copy;
    });
  };

  const deleteItem = (si, ii) => {
    const ok = window.confirm("Delete this card?");
    if (!ok) return;

    setSections((p) => {
      const copy = [...p];
      const s = copy[si];
      const items = (s.items || []).filter((_, i) => i !== ii);

      // لو السكشن بقى فاضي بعد الحذف، سيبه فاضي (وهيتحذف تلقائيًا وقت الـ Save)
      copy[si] = { ...s, items };
      return copy;
    });
  };

  const updateItemField = (si, ii, key, value) => {
    setSections((p) => {
      const copy = [...p];
      const s = copy[si];
      const items = [...(s.items || [])];
      items[ii] = { ...items[ii], [key]: value };
      copy[si] = { ...s, items };
      return copy;
    });
  };

  // ---------- Upload image (optional) ----------
  const uploadImage = async (si, ii, file) => {
    if (!file) return;
    try {
      setErr("");
      setOk("");

      const res = await api.uploadImage(file); // { ok, url } OR { url }
      const url = res?.url || res; // support both shapes

      if (!url) throw new Error("Upload returned no URL");

      updateItemField(si, ii, "imageUrl", url);
      setOk("✅ Image uploaded");
    } catch (e) {
      setErr(e?.message || "Upload failed");
    }
  };

  // ---------- Save (smart clean, no strict required for optionals) ----------
  const onSave = async () => {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      const cleaned = (sections || [])
        .map((s, si) => {
          const sectionId = sanitizeId(s.sectionId || s.id || s.slug || "");
          const title = String(s.title || "").trim();
          const caption = String(s.caption || "").trim();
          const enabled = s.enabled !== false;

          // Cards: only title is required
          const items = (Array.isArray(s.items) ? s.items : [])
            .map((it) => {
              const itemTitle = String(it.title || it.name || "").trim();
              return {
                id: sanitizeId(it.id || ""),
                title: itemTitle,
                imageUrl: String(it.imageUrl || it.image || "").trim(),
                fullText: String(it.fullText || it.description || "").trim(),
                moreContent: String(it.moreContent || it.more || "").trim(),
              };
            })
            .filter((it) => it.title); // keep only cards that have a title

          // ✅ Rules:
          // - Section must have sectionId + title
          // - If section has no items after cleaning -> drop it (so deletion is easy)
          if (!sectionId || !title) return null;
          if (items.length === 0) return null;

          return {
            enabled,
            sectionId,
            title,
            caption,
            items,
          };
        })
        .filter(Boolean);

      const payload = { dynamicSections: cleaned };

      const res = await api.updateContent(payload);
      if (!res?.ok) throw new Error(res?.message || "Save failed");

      setOk("✅ Saved");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Dynamic Sections</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Dynamic Sections</h2>
          <button className="btn primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {err ? <div className="alert error">❌ {err}</div> : null}
        {ok ? <div className="alert ok">{ok}</div> : null}

        <div className="row between" style={{ marginTop: 12 }}>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Only <b>Section Title</b>, <b>Section ID</b>, and each card <b>Title</b> are required.
          </p>
          <button className="btn" onClick={addSection}>
            + Add Section
          </button>
        </div>
      </div>

      {(sections || []).map((s, si) => (
        <div className="card" key={s._id || si}>
          <div className="row between">
            <h3 style={{ margin: 0 }}>Section #{si + 1}</h3>
            <button className="btn danger" onClick={() => deleteSection(si)}>
              Delete Section
            </button>
          </div>

          <div className="row" style={{ gap: 16, marginTop: 10, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={s.enabled !== false}
                onChange={(e) => updateSectionField(si, "enabled", e.target.checked)}
              />
              Enabled
            </label>
          </div>

          <div className="grid2" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Section Title *</label>
              <input
                className="input"
                value={s.title || ""}
                onChange={(e) => updateSectionField(si, "title", e.target.value)}
                placeholder="Students"
              />
            </div>

            <div className="field">
              <label>Section ID * (used for navigation)</label>
              <input
                className="input"
                value={s.sectionId || ""}
                onChange={(e) => updateSectionField(si, "sectionId", e.target.value)}
                placeholder="students"
              />
              <div className="muted small" style={{ marginTop: 6 }}>
                Will be auto-sanitized (spaces → dashes).
              </div>
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Caption (optional)</label>
            <input
              className="input"
              value={s.caption || ""}
              onChange={(e) => updateSectionField(si, "caption", e.target.value)}
              placeholder="Short text under the title"
            />
          </div>

          <div className="row between" style={{ marginTop: 12 }}>
            <h4 style={{ margin: 0 }}>Cards</h4>
            <button className="btn" onClick={() => addItem(si)}>
              + Add Card
            </button>
          </div>

          {(s.items || []).length === 0 ? (
            <div className="muted" style={{ marginTop: 10 }}>
              No cards. (If you save now, this section will be removed.)
            </div>
          ) : null}

          {(s.items || []).map((it, ii) => (
            <div
              key={it._id || ii}
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="row between">
                <strong>Card #{ii + 1}</strong>
                <button className="btn danger" onClick={() => deleteItem(si, ii)}>
                  Delete Card
                </button>
              </div>

              <div className="grid2" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Title *</label>
                  <input
                    className="input"
                    value={it.title || ""}
                    onChange={(e) => updateItemField(si, ii, "title", e.target.value)}
                    placeholder="Ahmed Ali"
                  />
                </div>

                <div className="field">
                  <label>ID (optional)</label>
                  <input
                    className="input"
                    value={it.id || ""}
                    onChange={(e) => updateItemField(si, ii, "id", e.target.value)}
                    placeholder="ahmed-ali"
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Image (optional)</label>

                {it.imageUrl ? (
                  <div style={{ marginBottom: 10 }}>
                    <img
                      src={it.imageUrl}
                      alt="preview"
                      style={{
                        width: "100%",
                        maxWidth: 360,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    />
                  </div>
                ) : null}

                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <input
                    className="input"
                    value={it.imageUrl || ""}
                    onChange={(e) => updateItemField(si, ii, "imageUrl", e.target.value)}
                    placeholder="Paste URL or upload"
                    style={{ flex: 1 }}
                  />

                  <label className="btn" style={{ cursor: "pointer" }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => uploadImage(si, ii, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Description (optional)</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={it.fullText || ""}
                  onChange={(e) => updateItemField(si, ii, "fullText", e.target.value)}
                  placeholder="Write a short description..."
                />
              </div>

              <div className="field" style={{ marginTop: 10 }}>
                <label>More Content (optional)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={it.moreContent || ""}
                  onChange={(e) => updateItemField(si, ii, "moreContent", e.target.value)}
                  placeholder="Extra text shown after clicking More..."
                />
              </div>

              <div className="muted small" style={{ marginTop: 8 }}>
                Note: If you leave the card title empty, it will be removed on Save.
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
