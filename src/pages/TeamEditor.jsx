import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const emptyMember = () => ({
  name: "",
  title: "",
  imageUrl: "",
  description: "",
});

const emptyGroup = () => ({
  name: "",
  members: [emptyMember()],
});

export default function TeamEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(""); // "gi-mi"
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // validation errors object
  const [fieldErrors, setFieldErrors] = useState({}); // { "g0.name": "...", "g0.m0.name": "...", ... }

  const [team, setTeam] = useState({
    heading: "Meet Our Leadership",
    groups: [],
  });

  const hasGroups = useMemo(() => (team?.groups?.length || 0) > 0, [team]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setOkMsg("");

        const res = await api.getContent();
        const doc = res?.data;

        const t = doc?.team || {};
        const groups = Array.isArray(t.groups) ? t.groups : [];

        if (mounted) {
          setTeam({
            heading: t.heading || "Meet Our Leadership",
            groups: groups.length ? groups : [emptyGroup()],
          });
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load team content");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setHeading = (v) => setTeam((prev) => ({ ...prev, heading: v }));

  const addGroup = () => {
    setTeam((prev) => ({
      ...prev,
      groups: [...(prev.groups || []), emptyGroup()],
    }));
  };

  const removeGroup = (gi) => {
    setTeam((prev) => ({
      ...prev,
      groups: (prev.groups || []).filter((_, i) => i !== gi),
    }));
  };

  const updateGroupName = (gi, v) => {
    setTeam((prev) => {
      const groups = [...(prev.groups || [])];
      groups[gi] = { ...groups[gi], name: v };
      return { ...prev, groups };
    });
  };

  const addMember = (gi) => {
    setTeam((prev) => {
      const groups = [...(prev.groups || [])];
      const g = groups[gi];
      const members = [...(g.members || []), emptyMember()];
      groups[gi] = { ...g, members };
      return { ...prev, groups };
    });
  };

  const removeMember = (gi, mi) => {
    setTeam((prev) => {
      const groups = [...(prev.groups || [])];
      const g = groups[gi];
      const members = (g.members || []).filter((_, i) => i !== mi);
      // متسيبش الجروب فاضي تمامًا بالغلط (اختياري)
      groups[gi] = { ...g, members: members.length ? members : [emptyMember()] };
      return { ...prev, groups };
    });
  };

  const updateMemberField = (gi, mi, field, value) => {
    setTeam((prev) => {
      const groups = [...(prev.groups || [])];
      const g = groups[gi];
      const members = [...(g.members || [])];
      members[mi] = { ...members[mi], [field]: value };
      groups[gi] = { ...g, members };
      return { ...prev, groups };
    });
  };

  // ✅ Upload handler
  const onPickImage = async (gi, mi, file) => {
    if (!file) return;
    try {
      setError("");
      setOkMsg("");
      setUploadingKey(`${gi}-${mi}`);

      const res = await api.uploadImage(file);
      if (!res?.ok) throw new Error(res?.message || "Upload failed");
      if (!res?.url) throw new Error("Upload returned no url");

      updateMemberField(gi, mi, "imageUrl", res.url);
      setOkMsg("✅ Image uploaded");
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploadingKey("");
    }
  };

  // ✅ Strict validation: لازم كل فيلد
  const validateAll = () => {
    const errs = {};

    const heading = (team.heading || "").trim();
    if (!heading) errs["team.heading"] = "Heading is required";

    (team.groups || []).forEach((g, gi) => {
      const gName = (g.name || "").trim();
      if (!gName) errs[`g${gi}.name`] = "Group name is required";

      (g.members || []).forEach((m, mi) => {
        const name = (m.name || "").trim();
        const title = (m.title || "").trim();
        const imageUrl = (m.imageUrl || "").trim();
        const desc = (m.description || "").trim();

        if (!name) errs[`g${gi}.m${mi}.name`] = "Member name is required";
        if (!title) errs[`g${gi}.m${mi}.title`] = "Member title is required";
        if (!imageUrl) errs[`g${gi}.m${mi}.imageUrl`] = "Member image is required";
        if (!desc) errs[`g${gi}.m${mi}.description`] = "Member description is required";
      });
    });

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError("");
      setOkMsg("");

      const ok = validateAll();
      if (!ok) {
        throw new Error("Please fill all required fields");
      }

      // هنا بقى ننضّف ونبعت
      const cleanedGroups = (team.groups || []).map((g) => ({
        name: (g.name || "").trim(),
        members: (g.members || []).map((m) => ({
          name: (m.name || "").trim(),
          title: (m.title || "").trim(),
          imageUrl: (m.imageUrl || "").trim(),
          description: (m.description || "").trim(),
        })),
      }));

      const payload = {
        team: {
          heading: (team.heading || "").trim(),
          groups: cleanedGroups,
        },
      };

      const res = await api.updateContent(payload);
      if (!res?.ok) throw new Error(res?.message || "Save failed");

      setOkMsg("✅ Saved successfully");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const errText = (key) => fieldErrors?.[key] || "";

  if (loading) {
    return (
      <div className="card">
        <h2>Team Editor</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Team Editor</h2>
          <button className="btn primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {error ? <div className="alert error">❌ {error}</div> : null}
        {okMsg ? <div className="alert ok">{okMsg}</div> : null}

        <div className="field">
          <label>
            Heading <span style={{ color: "#ff5a7a" }}>*</span>
          </label>
          <input
            className="input"
            value={team.heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Meet Our Leadership"
          />
          {errText("team.heading") ? (
            <div className="hint error">{errText("team.heading")}</div>
          ) : null}
        </div>

        <div className="row between" style={{ marginTop: 10 }}>
          <h3 style={{ margin: 0 }}>Groups</h3>
          <button className="btn" onClick={addGroup}>
            + Add Group
          </button>
        </div>

        {!hasGroups ? <p style={{ opacity: 0.8 }}>No groups yet.</p> : null}
      </div>

      {(team.groups || []).map((g, gi) => (
        <div className="card" key={gi}>
          <div className="row between">
            <h3 style={{ margin: 0 }}>Group #{gi + 1}</h3>
            <button className="btn danger" onClick={() => removeGroup(gi)}>
              Delete Group
            </button>
          </div>

          <div className="field">
            <label>
              Group Name <span style={{ color: "#ff5a7a" }}>*</span>
            </label>
            <input
              className="input"
              value={g.name}
              onChange={(e) => updateGroupName(gi, e.target.value)}
              placeholder='e.g. "Computer Engineering"'
            />
            {errText(`g${gi}.name`) ? (
              <div className="hint error">{errText(`g${gi}.name`)}</div>
            ) : null}
          </div>

          <div className="row between" style={{ marginTop: 10 }}>
            <h4 style={{ margin: 0 }}>Members</h4>
            <button className="btn" onClick={() => addMember(gi)}>
              + Add Member
            </button>
          </div>

          {(g.members || []).map((m, mi) => {
            const key = `${gi}-${mi}`;
            const isUploading = uploadingKey === key;

            return (
              <div
                key={mi}
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="row between">
                  <strong>
                    Member #{mi + 1}{" "}
                    <span style={{ color: "#ff5a7a" }}>*</span>
                  </strong>
                  <button
                    className="btn danger"
                    onClick={() => removeMember(gi, mi)}
                  >
                    Delete
                  </button>
                </div>

                <div className="grid2" style={{ marginTop: 10 }}>
                  <div className="field">
                    <label>
                      Name <span style={{ color: "#ff5a7a" }}>*</span>
                    </label>
                    <input
                      className="input"
                      value={m.name}
                      onChange={(e) =>
                        updateMemberField(gi, mi, "name", e.target.value)
                      }
                      placeholder="Dr. Ahmad Anwar"
                    />
                    {errText(`g${gi}.m${mi}.name`) ? (
                      <div className="hint error">{errText(`g${gi}.m${mi}.name`)}</div>
                    ) : null}
                  </div>

                  <div className="field">
                    <label>
                      Title <span style={{ color: "#ff5a7a" }}>*</span>
                    </label>
                    <input
                      className="input"
                      value={m.title}
                      onChange={(e) =>
                        updateMemberField(gi, mi, "title", e.target.value)
                      }
                      placeholder="CEO & Founder"
                    />
                    {errText(`g${gi}.m${mi}.title`) ? (
                      <div className="hint error">{errText(`g${gi}.m${mi}.title`)}</div>
                    ) : null}
                  </div>
                </div>

                {/* ✅ Upload Image */}
                <div className="field" style={{ marginTop: 10 }}>
                  <label>
                    Image <span style={{ color: "#ff5a7a" }}>*</span>
                  </label>

                  <div className="row" style={{ gap: 10, alignItems: "center" }}>
                    <input
                      className="input"
                      value={m.imageUrl}
                      onChange={(e) =>
                        updateMemberField(gi, mi, "imageUrl", e.target.value)
                      }
                      placeholder="Will be filled after upload"
                      style={{ flex: 1 }}
                      readOnly
                    />

                    <label className="btn" style={{ cursor: "pointer" }}>
                      {isUploading ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={isUploading}
                        onChange={(e) => onPickImage(gi, mi, e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  {errText(`g${gi}.m${mi}.imageUrl`) ? (
                    <div className="hint error">{errText(`g${gi}.m${mi}.imageUrl`)}</div>
                  ) : null}

                  {/* preview */}
                  {m.imageUrl ? (
                    <div style={{ marginTop: 10 }}>
                      <img
                        src={m.imageUrl}
                        alt="preview"
                        style={{
                          width: 140,
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="field" style={{ marginTop: 10 }}>
                  <label>
                    Description <span style={{ color: "#ff5a7a" }}>*</span>
                  </label>
                  <textarea
                    className="textarea"
                    rows={5}
                    value={m.description}
                    onChange={(e) =>
                      updateMemberField(gi, mi, "description", e.target.value)
                    }
                    placeholder="Write full bio..."
                  />
                  {errText(`g${gi}.m${mi}.description`) ? (
                    <div className="hint error">{errText(`g${gi}.m${mi}.description`)}</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
