import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://student-tool.onrender.com/api", // replace with your production URL
  headers: { "Content-Type": "application/json" },
});

// ---- Read endpoints ----
export const getInstituteTypes = () =>
  api.get("/institute-types/get-institute-types", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }); // or /institute-types
export const getStates = () => api.get("/states/get-states", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
}); // or /states
export const getInstitutesByState = (stateId: string, typeId: string) =>
  api.get(`/institutes/get-institutes?stateId=${encodeURIComponent(stateId)}&typeId=${encodeURIComponent(typeId)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }); // or /institutes?stateId=...
export const getCoursesByInstitute = (instituteId: string) =>
  api.get(`/courses/get-courses-by-institute?instituteId=${encodeURIComponent(instituteId)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }); // or /courses?instituteId=...
export const getCourseSubjects = (courseId: string) =>
  api.get(`/courses/subjects/${encodeURIComponent(courseId)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }); // based on earlier scaffolding

// ---- Update endpoints ----
export const updateState = (id: string, payload: any) =>
  api.put(`/states/update-state/${encodeURIComponent(id)}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const updateInstituteType = (id: string, payload: any) =>
  api.put(`/institute-types/update-institute-type/${encodeURIComponent(id)}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const updateInstitute = (id: string, payload: any) =>
  api.put(`/institutes/update-institute/${encodeURIComponent(id)}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const updateCourse = (id: string, payload: any) =>
  api.put(`/courses/update-course/${encodeURIComponent(id)}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const updateCourseSubjects = (id: string, payload: any) =>
  api.patch(`/courses/${encodeURIComponent(id)}/subjects`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }); // Not yet Available

// ---- Delete endpoints ----
export const deleteState = (id: string) =>
  api.delete(`/states/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const deleteInstituteType = (id: string) =>
  api.delete(`/institute-types/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const deleteInstitute = (id: string) =>
  api.delete(`/institutes/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const deleteCourse = (id: string) =>
  api.delete(`/courses/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
export const deleteSubject = (
  courseId: string,
  subjectType: "jamb" | "olevel",
  subject: string
) =>
  api.delete(`/courses/${encodeURIComponent(courseId)}/subjects`, {
    data: { subjectType, subject },
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
// Note: adjust deleteSubject shape to match your backend (maybe patch with removal array)

export default api;
