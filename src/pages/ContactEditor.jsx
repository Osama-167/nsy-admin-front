import React, { useEffect, useState } from "react";
import { api } from "../api";

const emptySocial = { type: "facebook", url: "" };

const normalizeSocialLinks = (links) => {
  const arr = Array.isArray(links) ? links : [];
  return arr
    .map((x) => ({
      type: String(x?.type || "").trim().toLowerCase(),
      url: String(x?.url || "").trim(),
    }))
    // remove empty rows
    .filter((x) => x.type && x.url)
    // must be valid url (http/https)
    .filter((x) => /^https?:\/\/.+/i.test(x.url));
};

export default function ContactEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [contact, setContact] = useState({
    title: "",
    caption: "",
    email: "",
    whatsapp: "",
  });

  const [footer, setFooter] = useState({
    aboutText: "",
    email: "",
    whatsapp: "",
    copyright: "",
    socialLinks: [],
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.getContent();
        const data = res?.data || {};

        if (!mounted) return;

        setContact({
          title: data.contact?.title || "",
          caption: data.contact?.caption || "",
          email: data.contact?.email || "",
          whatsapp: data.contact?.whatsapp || "",
        });

        setFooter({
          aboutText: data.footer?.aboutText || "",
          email: data.footer?.email || "",
          whatsapp: data.footer?.whatsapp || "",
          copyright: data.footer?.copyright || "",
          socialLinks: Array.isArray(data.footer?.socialLinks)
            ? data.footer.socialLinks.map((x) => ({
                type: String(x?.type || "facebook").trim().toLowerCase(),
                url: String(x?.url || "").trim(),
              }))
            : [],
        });
      } catch (e) {
        if (mounted) setErr("Failed to load contact/footer data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      const cleanedSocial = normalizeSocialLinks(footer.socialLinks);

      const payload = {
        contact: {
          title: (contact.title || "").trim(),
          caption: (contact.caption || "").trim(),
          email: (contact.email || "").trim(),
          whatsapp: (contact.whatsapp || "").trim(),
        },
        footer: {
          aboutText: (footer.aboutText || "").trim(),
          email: (footer.email || "").trim(),
          whatsapp: (footer.whatsapp || "").trim(),
          copyright: (footer.copyright || "").trim(),
          socialLinks: cleanedSocial,
        },
      };

      const res = await api.updateContent(payload);
      if (!res?.ok) throw new Error(res?.message || "Save failed");

      setOk("✅ Contact & Footer updated successfully");
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Contact Editor</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Contact & Footer</h2>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {err && <div className="alert error">❌ {err}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      {/* CONTACT */}
      <h3 style={{ marginTop: 24 }}>Contact Section</h3>

      <div className="field">
        <label>Title</label>
        <input
          className="input"
          value={contact.title}
          onChange={(e) => setContact((p) => ({ ...p, title: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>Caption</label>
        <input
          className="input"
          value={contact.caption}
          onChange={(e) =>
            setContact((p) => ({ ...p, caption: e.target.value }))
          }
        />
      </div>

      <div className="field">
        <label>Email</label>
        <input
          className="input"
          value={contact.email}
          onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>WhatsApp (no +)</label>
        <input
          className="input"
          value={contact.whatsapp}
          onChange={(e) =>
            setContact((p) => ({ ...p, whatsapp: e.target.value }))
          }
        />
      </div>

      {/* FOOTER */}
      <h3 style={{ marginTop: 32 }}>Footer</h3>

      <div className="field">
        <label>About text</label>
        <textarea
          className="input"
          rows={3}
          value={footer.aboutText}
          onChange={(e) =>
            setFooter((p) => ({ ...p, aboutText: e.target.value }))
          }
        />
      </div>

      <div className="field">
        <label>Footer Email</label>
        <input
          className="input"
          value={footer.email}
          onChange={(e) => setFooter((p) => ({ ...p, email: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>Footer WhatsApp</label>
        <input
          className="input"
          value={footer.whatsapp}
          onChange={(e) =>
            setFooter((p) => ({ ...p, whatsapp: e.target.value }))
          }
        />
      </div>

      <div className="field">
        <label>Copyright</label>
        <input
          className="input"
          value={footer.copyright}
          onChange={(e) =>
            setFooter((p) => ({ ...p, copyright: e.target.value }))
          }
        />
      </div>

      {/* SOCIAL LINKS */}
      <h4 style={{ marginTop: 24 }}>Social Links</h4>

      {footer.socialLinks.map((s, i) => (
        <div key={i} className="row gap">
          <select
            className="input"
            value={s.type}
            onChange={(e) => {
              const list = [...footer.socialLinks];
              list[i] = { ...list[i], type: e.target.value };
              setFooter((p) => ({ ...p, socialLinks: list }));
            }}
          >
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>

          <input
            className="input"
            placeholder="https://..."
            value={s.url}
            onChange={(e) => {
              const list = [...footer.socialLinks];
              list[i] = { ...list[i], url: e.target.value };
              setFooter((p) => ({ ...p, socialLinks: list }));
            }}
          />

          <button
            className="btn danger"
            onClick={() =>
              setFooter((p) => ({
                ...p,
                socialLinks: p.socialLinks.filter((_, x) => x !== i),
              }))
            }
          >
            ✕
          </button>
        </div>
      ))}

      <button
        className="btn"
        style={{ marginTop: 12 }}
        onClick={() =>
          setFooter((p) => ({
            ...p,
            socialLinks: [...p.socialLinks, { ...emptySocial }],
          }))
        }
      >
        + Add Social Link
      </button>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Note: Social links must start with <b>http://</b> or <b>https://</b>.
      </div>
    </div>
  );
}
