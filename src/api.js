import axios from "axios";

const API = axios.create({
  baseURL: "nsybckend-production-a891.up.railway.app",
});

// =====================
// HEALTH
// =====================
export const health = async () => {
  const res = await API.get("/health");
  return res.data; // { ok, message }
};

// =====================
// CONTENT
// =====================
export const getContent = async () => {
  const res = await API.get("/content");
  return res.data; // { ok, data }
};

export const updateContent = async (payload) => {
  const res = await API.put("/content", payload);
  return res.data; // { ok, data }
};

// =====================
// REGISTRATIONS
// =====================
// optional filter by status:
// GET /registrations?status=accepted
export const getRegistrations = async (status = "") => {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await API.get(`/registrations${qs}`);
  return res.data; // { ok, data: [...] } OR { ok, data }
};

// PATCH /registrations/:id/status  body: { status: "accepted" }
export const updateRegistrationStatus = async (id, status) => {
  const res = await API.patch(`/registrations/${id}/status`, { status });
  return res.data; // { ok, data }
};

// DELETE /registrations/:id
export const deleteRegistration = async (id) => {
  const res = await API.delete(`/registrations/${id}`);
  return res.data; // { ok }
};

// =====================
// UPLOAD IMAGE
// =====================
export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append("image", file);

  const res = await API.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { ok, url }
};

// ✅ ONE OBJECT EXPORT
export const api = {
  health,
  getContent,
  updateContent,

  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,

  uploadImage,
};
