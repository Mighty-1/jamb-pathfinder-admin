import React, { useEffect, useMemo, useState } from "react";
import {
  getInstituteTypes,
  getStates,
  getInstitutesByState,
  getCoursesByInstitute,
  getCourseSubjects,
  updateState,
  updateInstituteType,
  updateInstitute,
  updateCourse,
  updateCourseSubjects,
  deleteState,
  deleteInstituteType,
  deleteInstitute,
  deleteCourse,
  // deleteSubject (if your backend supports)
} from "../services/adminService";

// UI components - replace or adapt to your design system if needed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // optional
import { Button } from "@/components/ui/button"; // optional

type IdName = { id: string; name: string };

export default function AllData() {
  const [loading, setLoading] = useState({
    types: false,
    states: false,
    institutes: false,
    courses: false,
    subjects: false,
  });

  const [instituteTypes, setInstituteTypes] = useState<IdName[]>([]);
  const [states, setStates] = useState<IdName[]>([]);
  const [institutes, setInstitutes] = useState<IdName[]>([]);
  const [courses, setCourses] = useState<IdName[]>([]);
  const [subjects, setSubjects] = useState<{
    jamb: string[];
    olevel: string[];
    compulsoryJamb?: string[];
    compulsoryOlevel?: string[];
  }>({ jamb: [], olevel: [], compulsoryJamb: [], compulsoryOlevel: [] });

  const [selected, setSelected] = useState({
    typeId: "",
    stateId: "",
    instituteId: "",
    courseId: "",
  });

  const [error, setError] = useState<string | null>(null);

  // load top-level lists
  useEffect(() => {
    const loadTop = async () => {
      try {
        setLoading((s) => ({ ...s, types: true, states: true }));
        const [typesRes, statesRes] = await Promise.all([
          getInstituteTypes(),
          getStates(),
        ]);

        // normalize helper
        const normalize = (
          arr: any[],
          nameKeys = ["name", "instType", "state", "instName"]
        ) =>
          (Array.isArray(arr) ? arr : []).map((p: any) => {
            if (typeof p === "string") return { id: p, name: p };
            const id = String(p._id ?? p.id ?? p._doc?._id ?? "");
            const name = (
              p.name ??
              p.instType ??
              p.state ??
              p.instName ??
              p.stateName ??
              ""
            ).toString();
            return { id, name };
          });

        setInstituteTypes(normalize(typesRes.data, ["instType", "name"]));
        setStates(normalize(statesRes.data, ["stateName", "name", "state"]));
      } catch (err) {
        console.error(err);
        setError("Failed to load institute types / states");
      } finally {
        setLoading((s) => ({ ...s, types: false, states: false }));
      }
    };
    loadTop();
  }, []);

  // load institutes when state changes
  useEffect(() => {
    const loadInstitutes = async () => {
      if (!selected.stateId) {
        setInstitutes([]);
        setSelected((s) => ({ ...s, instituteId: "", courseId: "" }));
        return;
      }
      try {
        setLoading((s) => ({ ...s, institutes: true }));
        const res = await getInstitutesByState(
          selected.stateId,
          selected.typeId
        );
        const arr = Array.isArray(res.data)
          ? res.data
          : res.data?.institutes ?? [];
        const normalized = arr.map((p: any) => ({
          id: String(p._id ?? p.id ?? p._doc?._id ?? p.institute ?? ""),
          name:
            p.instName ??
            p.name ??
            p.instituteName ??
            p.institute ??
            String(p._id ?? p.id ?? ""),
        }));
        setInstitutes(normalized);
      } catch (err) {
        console.error(err);
        setInstitutes([]);
      } finally {
        setLoading((s) => ({ ...s, institutes: false }));
      }
    };
    loadInstitutes();
  }, [selected.stateId]);

  // load courses when institute changes
  useEffect(() => {
    const loadCourses = async () => {
      if (!selected.instituteId) {
        setCourses([]);
        setSelected((s) => ({ ...s, courseId: "" }));
        return;
      }
      try {
        setLoading((s) => ({ ...s, courses: true }));
        const res = await getCoursesByInstitute(selected.instituteId);
        const arr = Array.isArray(res.data)
          ? res.data
          : res.data?.courses ?? [];
        const normalized = arr.map((p: any) => ({
          id: String(p._id ?? p.id ?? ""),
          name: p.course ?? p.courseName ?? p.name ?? p.course ?? "",
        }));
        setCourses(normalized);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading((s) => ({ ...s, courses: false }));
      }
    };
    loadCourses();
  }, [selected.instituteId]);

  // load subjects when course changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selected.courseId) {
        setSubjects({ jamb: [], olevel: [] });
        return;
      }
      try {
        setLoading((s) => ({ ...s, subjects: true }));
        const res = await getCourseSubjects(selected.courseId);
        // support { olevelSubjects: [], jambSubjects: [] } or { olevel: [], jamb: [] }
        const d = res.data ?? res;
        const jamb = d.jamb ?? d.jambSubjects ?? d.jambSubjects ?? [];
        const olevel = d.olevel ?? d.olevelSubjects ?? d.olevelSubjects ?? [];
        const compulsoryJamb = d.compulsoryJamb ?? [];
        const compulsoryOlevel = d.compulsoryOlevel ?? [];
        setSubjects({ jamb, olevel, compulsoryJamb, compulsoryOlevel });
      } catch (err) {
        console.error(err);
        setSubjects({
          jamb: [],
          olevel: [],
          compulsoryJamb: [],
          compulsoryOlevel: [],
        });
      } finally {
        setLoading((s) => ({ ...s, subjects: false }));
      }
    };
    loadSubjects();
  }, [selected.courseId]);

  // ---------- Edit handlers (prompt-based for quick admin UI) ----------
  const handleEdit = async (
    resource: "state" | "type" | "institute" | "course",
    id: string,
    currentName: string
  ) => {
    const newName = window.prompt(`Edit ${resource} name`, currentName);
    if (
      !newName ||
      newName.trim() === "" ||
      newName.trim() === currentName.trim()
    )
      return;
    try {
      if (resource === "state") {
        await updateState(id, { state: newName.trim() });
        setStates((s) =>
          s.map((st) => (st.id === id ? { ...st, name: newName } : st))
        );
        alert("State updated");
      } else if (resource === "type") {
        await updateInstituteType(id, { instType: newName.trim() });
        setInstituteTypes((s) =>
          s.map((t) => (t.id === id ? { ...t, name: newName } : t))
        );
        alert("Institute type updated");
      } else if (resource === "institute") {
        await updateInstitute(id, { instName: newName.trim() });
        setInstitutes((s) =>
          s.map((i) => (i.id === id ? { ...i, name: newName } : i))
        );
        alert("Institute updated");
      } else if (resource === "course") {
        await updateCourse(id, { course: newName.trim() });
        setCourses((s) =>
          s.map((c) => (c.id === id ? { ...c, name: newName } : c))
        );
        alert("Course updated");
      }
    } catch (err: any) {
      console.error("Update failed", err);
      alert(
        "Update failed: " +
          (err.response?.data?.message ?? err.message ?? "Unknown error")
      );
    }
  };

  // ---------- Delete handlers ----------
  const handleDelete = async (
    resource: "state" | "type" | "institute" | "course" | "subject",
    payload: any
  ) => {
    const ok = window.confirm(
      `Are you sure you want to delete this ${resource}? This action cannot be undone.`
    );
    if (!ok) return;
    try {
      if (resource === "state") {
        await deleteState(payload.id);
        setStates((s) => s.filter((x) => x.id !== payload.id));
        // clear selected if deleted
        if (selected.stateId === payload.id)
          setSelected((s) => ({
            ...s,
            stateId: "",
            instituteId: "",
            courseId: "",
          }));
        alert("Deleted state");
      } else if (resource === "type") {
        await deleteInstituteType(payload.id);
        setInstituteTypes((s) => s.filter((x) => x.id !== payload.id));
        alert("Deleted type");
      } else if (resource === "institute") {
        await deleteInstitute(payload.id);
        setInstitutes((s) => s.filter((x) => x.id !== payload.id));
        if (selected.instituteId === payload.id)
          setSelected((s) => ({ ...s, instituteId: "", courseId: "" }));
        alert("Deleted institute");
      } else if (resource === "course") {
        await deleteCourse(payload.id);
        setCourses((s) => s.filter((x) => x.id !== payload.id));
        if (selected.courseId === payload.id)
          setSelected((s) => ({ ...s, courseId: "" }));
        alert("Deleted course");
      } else if (resource === "subject") {
        // implement backend call if available
        // await deleteSubject(payload.courseId, payload.subjectType, payload.subject)
        alert(
          "Subject delete should call the appropriate API - implement according to your server."
        );
        // then update subjects locally:
        // setSubjects(...)
      }
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(
        "Delete failed: " +
          (err.response?.data?.message ?? err.message ?? "Unknown error")
      );
    }
  };

  // ---------- rendering helpers ----------
  const renderSelect = (
    items: IdName[],
    value: string,
    onChange: (v: string) => void,
    placeholder = "Choose"
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded px-3 py-2"
    >
      <option value="">{placeholder}</option>
      {items.map((it) => (
        <option key={it.id} value={it.id}>
          {it.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-accent to-muted">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            All Data (Admin)
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage Institute types, States, Institutes, Courses & Subjects
          </p>
        </div>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Institute Type
                </label>
                {renderSelect(
                  instituteTypes,
                  selected.typeId,
                  (v) => setSelected((s) => ({ ...s, typeId: v })),
                  "All types"
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">State</label>
                {renderSelect(
                  states,
                  selected.stateId,
                  (v) => setSelected((s) => ({ ...s, stateId: v })),
                  "Choose state"
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Institute
                </label>
                {renderSelect(
                  institutes,
                  selected.instituteId,
                  (v) => setSelected((s) => ({ ...s, instituteId: v })),
                  "Choose institute"
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Course</label>
                {renderSelect(
                  courses,
                  selected.courseId,
                  (v) => setSelected((s) => ({ ...s, courseId: v })),
                  "Choose course"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: types & states */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institute Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {instituteTypes.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between border rounded p-2"
                    >
                      <span>{t.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit("type", t.id, t.name)}
                          className="text-sm px-3 py-1 border rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("type", { id: t.id })}
                          className="text-sm px-3 py-1 border rounded text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* States */}
            <Card>
              <CardHeader>
                <CardTitle>States</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {states.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between border rounded p-2"
                    >
                      <span>{s.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit("state", s.id, s.name)}
                          className="text-sm px-3 py-1 border rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("state", { id: s.id })}
                          className="text-sm px-3 py-1 border rounded text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right column: institutes, courses, subjects */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Institutes in selected State</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.institutes ? (
                  <p>Loading institutes...</p>
                ) : institutes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No institutes for selected state.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {institutes.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center justify-between border rounded p-2"
                      >
                        <div>
                          <div className="font-medium">{i.name}</div>
                          <div className="text-sm text-muted-foreground">
                            id: {i.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleEdit("institute", i.id, i.name)
                            }
                            className="text-sm px-3 py-1 border rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete("institute", { id: i.id })
                            }
                            className="text-sm px-3 py-1 border rounded text-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Courses in selected Institute</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.courses ? (
                  <p>Loading courses...</p>
                ) : courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No courses for selected institute.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {courses.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between border rounded p-2"
                      >
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-sm text-muted-foreground">
                            id: {c.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit("course", c.id, c.name)}
                            className="text-sm px-3 py-1 border rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete("course", { id: c.id })}
                            className="text-sm px-3 py-1 border rounded text-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects for selected Course</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.subjects ? (
                  <p>Loading subjects...</p>
                ) : (
                  <>
                    <div className="mb-3">
                      <h4 className="font-medium">JAMB</h4>
                      {subjects.jamb.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No jamb subjects
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {subjects.jamb.map((s) => (
                            <li
                              key={s}
                              className="px-3 py-1 border rounded flex items-center gap-2"
                            >
                              <span>{s}</span>
                              <button
                                onClick={() =>
                                  handleDelete("subject", {
                                    courseId: selected.courseId,
                                    subjectType: "jamb",
                                    subject: s,
                                  })
                                }
                                className="text-xs text-destructive"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium">Compulsory JAMB</h4>
                      {(!subjects.compulsoryJamb ||
                        subjects.compulsoryJamb.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No compulsory jamb subjects
                        </p>
                      )}
                      {subjects.compulsoryJamb &&
                        subjects.compulsoryJamb.length > 0 && (
                          <ul className="flex flex-wrap gap-2">
                            {subjects.compulsoryJamb.map((s) => (
                              <li
                                key={s}
                                className="px-3 py-1 border rounded flex items-center gap-2"
                              >
                                <span>{s}</span>
                                <button
                                  onClick={() =>
                                    handleDelete("subject", {
                                      courseId: selected.courseId,
                                      subjectType: "jamb",
                                      subject: s,
                                    })
                                  }
                                  className="text-xs text-destructive"
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    <div>
                      <h4 className="font-medium">O-Level</h4>
                      {subjects.olevel.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No o-level subjects
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {subjects.olevel.map((s) => (
                            <li
                              key={s}
                              className="px-3 py-1 border rounded flex items-center gap-2"
                            >
                              <span>{s}</span>
                              <button
                                onClick={() =>
                                  handleDelete("subject", {
                                    courseId: selected.courseId,
                                    subjectType: "olevel",
                                    subject: s,
                                  })
                                }
                                className="text-xs text-destructive"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium">Compulsory O-Level</h4>
                      {(!subjects.compulsoryOlevel ||
                        subjects.compulsoryOlevel.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No compulsory o-level subjects
                        </p>
                      )}
                      {subjects.compulsoryOlevel &&
                        subjects.compulsoryOlevel.length > 0 && (
                          <ul className="flex flex-wrap gap-2">
                            {subjects.compulsoryOlevel.map((s) => (
                              <li
                                key={s}
                                className="px-3 py-1 border rounded flex items-center gap-2"
                              >
                                <span>{s}</span>
                                <button
                                  onClick={() =>
                                    handleDelete("subject", {
                                      courseId: selected.courseId,
                                      subjectType: "olevel",
                                      subject: s,
                                    })
                                  }
                                  className="text-xs text-destructive"
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
