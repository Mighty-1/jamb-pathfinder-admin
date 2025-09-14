import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  School,
  MapPin,
  BookOpen,
  Users,
  Send,
} from "lucide-react";
import { SubjectSelector } from "./SubjectSelector";
import {
  nigerianStates,
  institutionTypes,
  olevelSubjects,
  jambSubjects,
} from "../data/formData";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface FormData {
  institutionName: string;
  institutionType: string;
  state: string;
  courseName: string;
  olevelSubjects: string[];
  jambSubjects: string[];
  compulsoryJambSubjects: string[];
  compulsoryOlevelSubjects: string[];
  contributorName: string;
  isAnonymous: boolean;
}

export function CourseSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    institutionName: "",
    institutionType: "",
    state: "",
    courseName: "",
    olevelSubjects: [],
    jambSubjects: [],
    compulsoryJambSubjects: [],
    compulsoryOlevelSubjects: [],
    contributorName: "",
    isAnonymous: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.institutionName &&
          formData.institutionType &&
          formData.state
        );
      case 2:
        return !!formData.courseName;
      case 3:
        return formData.olevelSubjects.length > 0;
      default:
        return true;
    }
  };

  // utility: resolves or creates a state and returns its id
  async function resolveOrCreateStateId(formState: string) {
    const FETCH_URL = "https://student-tool.onrender.com/api/states/get-states"; // your GET endpoint
    const POST_URL_CREATE_STATE = "https://student-tool.onrender.com/api/states/add-state"; // your POST endpoint (adjust if different)

    try {
      // normalize form input
      const formStateTrimmed = (formState ?? "").toString().trim();
      if (!formStateTrimmed) throw new Error("No state provided");

      const formStateLower = formStateTrimmed.toLowerCase();

      // 1) fetch all states
      const fetchState = await axios.get(FETCH_URL);
      // support responses that return array or wrapped object (defensive)
      const stateArray: any[] = Array.isArray(fetchState.data)
        ? fetchState.data
        : Array.isArray(fetchState.data.states)
        ? fetchState.data.states
        : [];

      // 2) normalize to { id, name }
      const normalized = stateArray.map((s: any) => ({
        id: String(s._id ?? s.id ?? ""),
        name: (s.stateName ?? s.name ?? s.state ?? "")
          .toString()
          .trim()
          .toLowerCase(),
        raw: s,
      }));

      // 3) try to find existing
      const existing = normalized.find((row) => row.name === formStateLower);

      if (existing && existing.id) {
        // found — return existing id and continue
        console.log("Found existing state:", existing);
        return existing.id;
      }

      // 4) not found — create it
      // send original-casing name (not lowercased) so DB stores pretty name
      const payload = { state: formStateTrimmed }; // adjust key if backend expects 'name' instead
      const createRes = await axios.post(POST_URL_CREATE_STATE, payload);

      // backend might return { _id, stateName } or { success: true, data: {...} } etc
      const created = createRes.data;
      // try common places where the id may be returned
      const createdId =
        (created &&
          (created._id ??
            created.id ??
            created.stateId ??
            created.data?._id ??
            created.data?.id)) ??
        null;

      if (!createdId) {
        // fallback: if response body is the created doc itself
        if (created && typeof created === "object" && created.stateName) {
          // try to read _id
          if (created._id) return String(created._id);
        }
        throw new Error("Could not determine ID of newly created state");
      }

      console.log("Created new state, id:", createdId);
      return String(createdId);
    } catch (err: any) {
      console.error(
        "resolveOrCreateStateId error:",
        err?.response?.data ?? err.message ?? err
      );
      // show toast and rethrow or return null depending on your flow
      toast({
        title: "State lookup/creation failed",
        description:
          err?.response?.data?.message ??
          err.message ??
          "Could not resolve or create state.",
        variant: "destructive",
      });
      throw err; // caller can decide whether to abort or continue
    }
  }

  async function resolveOrCreateInstituteType(formInstituteType: string) {
    const FETCH_URL =
      "https://student-tool.onrender.com/api/institute-types/get-institute-types"; // your GET endpoint
    const POST_URL_CREATE_INSTITUTE_TYPE =
      "https://student-tool.onrender.com/api/institute-types/add-institute-type"; // your POST endpoint (adjust if different)

    try {
      // normalize form input
      const formInstituteTypeTrimmed = (formInstituteType ?? "")
        .toString()
        .trim();
      if (!formInstituteTypeTrimmed)
        throw new Error("No institute type provided");

      const formInstituteTypeLower = formInstituteTypeTrimmed.toLowerCase();

      // 1) fetch all institute types
      const fetchInstituteTypes = await axios.get(FETCH_URL);
      // support responses that return array or wrapped object (defensive)
      const instituteTypeArray: any[] = Array.isArray(fetchInstituteTypes.data)
        ? fetchInstituteTypes.data
        : Array.isArray(fetchInstituteTypes.data.instType)
        ? fetchInstituteTypes.data.instType
        : [];

      // 2) normalize to { id, name }
      const normalized = instituteTypeArray.map((i: any) => ({
        id: String(i._id ?? i.id ?? ""),
        name: (i.instType ?? i.name ?? i.instituteName ?? "")
          .toString()
          .trim()
          .toLowerCase(),
        raw: i,
      }));

      // 3) try to find existing
      const existing = normalized.find(
        (row) => row.name === formInstituteTypeLower
      );

      if (existing && existing.id) {
        // found — return existing id and continue
        console.log("Found existing institute type:", existing);
        return existing.id;
      }

      // 4) not found — create it
      // send original-casing name (not lowercased) so DB stores pretty name
      const payload = { instName: formInstituteTypeTrimmed }; // adjust key if backend expects 'name' instead
      const createRes = await axios.post(
        POST_URL_CREATE_INSTITUTE_TYPE,
        payload
      );

      // backend might return { _id, instName } or { success: true, data: {...} } etc
      const created = createRes.data;
      // try common places where the id may be returned
      const createdId =
        (created &&
          (created._id ??
            created.id ??
            created.stateId ??
            created.data?._id ??
            created.data?.id)) ??
        null;

      if (!createdId) {
        // fallback: if response body is the created doc itself
        if (created && typeof created === "object" && created.instName) {
          // try to read _id
          if (created._id) return String(created._id);
        }
        throw new Error(
          "Could not determine ID of newly created institute type"
        );
      }

      console.log("Created new institute type, id:", createdId);
      return String(createdId);
    } catch (err: any) {
      console.error(
        "resolveOrCreateInstituteType error:",
        err?.response?.data ?? err.message ?? err
      );
      // show toast and rethrow or return null depending on your flow
      toast({
        title: "Institute type lookup/creation failed",
        description:
          err?.response?.data?.message ??
          err.message ??
          "Could not resolve or create institute type.",
        variant: "destructive",
      });
      throw err; // caller can decide whether to abort or continue
    }
  }

  async function searchExistingCourse(instituteId: string) {
    const FETCH_COURSES_URL = `https://student-tool.onrender.com/api/courses/get-courses-by-institute/${instituteId}`;
    try {
      const res = await axios.get(FETCH_COURSES_URL);
      const coursesArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.course)
        ? res.data.course
        : [];

      // normalize to { id, courseName }
      const normalizedCourses = coursesArray.map((c: any) => ({
        id: String(c._id ?? c.id ?? ""),
        courseName: (c.course ?? "").toString().trim().toLowerCase(),
      }));

      const formCourseNameTrimmed = (formData.courseName ?? "")
        .toString()
        .trim();
      const formCourseNameLower = formCourseNameTrimmed.toLowerCase();

      // find duplicate: same institute (by id OR name) AND same course name
      const duplicate = normalizedCourses.find((dbRow: any) => {
        const sameCourse =
          dbRow.courseName &&
          formCourseNameLower &&
          dbRow.courseName === formCourseNameLower;
        return sameCourse;
      });

      console.log("Duplicate course found:", duplicate);

      if (duplicate) {
        toast({
          title: "Duplicate Entry",
          description:
            "This course information already exists in the database. Update the existing entry instead.",
          variant: "destructive",
        });
        return; // stop further processing
      } else {
        // no duplicate found, safe to add
        await addCourse(instituteId, formCourseNameTrimmed);
      }
    } catch (err: any) {
      console.error(
        "Error fetching courses for institute:",
        err?.response?.data ?? err.message ?? err
      );
      toast({
        title: "Error",
        description: "Could not fetch existing courses for validation.",
        variant: "destructive",
      });
      return [];
    }
  }

  async function createInstitute(
    formInstituteName: string,
    stateId: string,
    instituteTypeId: string
  ) {
    const CREATE_INSTITUTE_URL = `https://student-tool.onrender.com/api/institutes/add-institute`;
    try {
      const res = await axios.post(CREATE_INSTITUTE_URL, {
        instName: formInstituteName,
        state: stateId,
        type: instituteTypeId,
      });
      console.log("Created new institute:", res.data && res.data._id);
      return String(res.data._id);
    } catch (err: any) {
      console.error(
        "Error creating institute:",
        err?.response?.data ?? err.message ?? err
      );
      toast({
        title: "Error",
        description: "Could not create institute. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  }

  // Adds a new course
  async function addCourse(institute: string, formCourseName: string) {
    const ADD_COURSE_URL = `https://student-tool.onrender.com/api/courses/add-course`;
    try {
      await axios.post(ADD_COURSE_URL, {
        course: formCourseName,
        institute: institute,
        olevelSubjects: formData.olevelSubjects,
        jambSubjects: formData.jambSubjects,
        compulsoryJambSubjects: formData.compulsoryJambSubjects,
        compulsoryOlevelSubjects: formData.compulsoryOlevelSubjects,
      });
      console.log("Added course:", formData);
      toast({
        title: "Success",
        description: "Course added successfully!",
        variant: "default",
      });
    } catch (err: any) {
      console.error(
        "Error adding course:",
        err?.response?.data ?? err.message ?? err
      );
      toast({
        title: "Error",
        description: "Could not add course. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleSubmit = async () => {
    try {
      const fetchInstitutes = await axios.get(
        "https://student-tool.onrender.com/api/institutes/all-institutes"
      );
      console.log("Institute data:", fetchInstitutes.data);

      // normalize top-level payload -> produce an array of course objects
      const raw = fetchInstitutes.data;
      const institutesArray = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.instName)
        ? raw.instName
        : [];

      // normalize DB rows to { id, instituteName }
      const normalizedInstitutes = institutesArray.map((i: any) => ({
        id: String(i._id ?? i.id ?? ""),
        instituteName: (i.instName ?? "").toString().trim().toLowerCase(),
      }));

      // normalize form values (make sure you use the correct form keys)
      const formInstituteNameTrimmed = (formData.institutionName ?? "")
        .toString()
        .trim();
      const formInstituteNameLower = formInstituteNameTrimmed.toLowerCase();

      const existingInstitute = normalizedInstitutes.find(
        (inst) => inst.instituteName === formInstituteNameLower
      );

      if (existingInstitute && existingInstitute.id) {
        console.log("Found existing institute:", existingInstitute);
        await searchExistingCourse(existingInstitute.id);
        return; // stop further processing
      } else {
        const stateId = await resolveOrCreateStateId(formData.state);
        const instituteTypeId = await resolveOrCreateInstituteType(
          formData.institutionType
        );
        const instituteId = await createInstitute(
          formInstituteNameTrimmed,
          stateId,
          instituteTypeId
        );
        const formCourseNameTrimmed = (formData.courseName ?? "")
          .toString()
          .trim();
        await addCourse(instituteId, formCourseNameTrimmed);
      }
    } catch (err: any) {
      console.error(
        "Failed to check courses:",
        err?.fetchInstitutes?.data ?? err.message ?? err
      );
      toast({
        title: "Error",
        description: "Could not validate course uniqueness. Try again.",
        variant: "destructive",
      });
    }

    // Simulate submission
    setIsSubmitted(true);
    toast({
      title: "Submission Successful!",
      description: "Thank you for contributing to the course database.",
      variant: "default",
    });
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-muted p-4">
        <Card className="w-full max-w-md text-center shadow-soft">
          <CardContent className="p-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-success mb-2">Success!</h3>
              <p className="text-muted-foreground">
                Your course information has been submitted successfully. Thank
                you for helping fellow students!
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  institutionName: "",
                  institutionType: "",
                  state: "",
                  courseName: "",
                  olevelSubjects: [],
                  jambSubjects: [],
                  compulsoryJambSubjects: [],
                  compulsoryOlevelSubjects: [],
                  contributorName: "",
                  isAnonymous: false,
                });
              }}
              className="w-full"
            >
              Submit Another Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">-
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <School className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Course Information Hub
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Help fellow students by sharing your course's subject requirements!
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && (
                <>
                  <School className="w-5 h-5" /> Institution Details
                </>
              )}
              {currentStep === 2 && (
                <>
                  <BookOpen className="w-5 h-5" /> Course Information
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Users className="w-5 h-5" /> Subject Requirements
                </>
              )}
              {currentStep === 4 && (
                <>
                  <Send className="w-5 h-5" /> Final Details
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your institution"}
              {currentStep === 2 && "Enter the course details"}
              {currentStep === 3 && "Specify the subject requirements"}
              {currentStep === 4 && "Add any additional information"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Institution Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    placeholder="e.g., University of Lagos"
                    value={formData.institutionName}
                    onChange={(e) =>
                      updateFormData("institutionName", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="institutionType">Institution Type</Label>
                  <Select
                    value={formData.institutionType}
                    onValueChange={(value) =>
                      updateFormData("institutionType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateFormData("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Course Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Computer Science, Medicine, Law"
                    value={formData.courseName}
                    onChange={(e) =>
                      updateFormData("courseName", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Subject Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    O'Level Requirements
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label>O'Level Subjects</Label>
                      <SubjectSelector
                        subjects={olevelSubjects}
                        selected={formData.olevelSubjects}
                        onChange={(subjects) =>
                          updateFormData("olevelSubjects", subjects)
                        }
                        placeholder="Select O'Level subjects"
                      />
                    </div>
                    <div>
                      <Label>Compulsory O'Level Subjects</Label>
                      <SubjectSelector
                        subjects={olevelSubjects}
                        selected={formData.compulsoryOlevelSubjects}
                        onChange={(subjects) =>
                          updateFormData("compulsoryOlevelSubjects", subjects)
                        }
                        placeholder="Select Compulsory O'Level subjects"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">
                    JAMB Requirements
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label>JAMB Subjects</Label>
                      <SubjectSelector
                        subjects={jambSubjects}
                        selected={formData.jambSubjects}
                        onChange={(subjects) =>
                          updateFormData("jambSubjects", subjects)
                        }
                        placeholder="Select JAMB subjects"
                      />
                    </div>
                    <div>
                      <Label>Compulsory JAMB Subjects</Label>
                      <SubjectSelector
                        subjects={jambSubjects}
                        selected={formData.compulsoryJambSubjects}
                        onChange={(subjects) =>
                          updateFormData("compulsoryJambSubjects", subjects)
                        }
                        placeholder="Select compulsory JAMB subjects"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Final Details */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) =>
                      updateFormData("isAnonymous", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously
                  </Label>
                </div>

                {!formData.isAnonymous && (
                  <div>
                    <Label htmlFor="contributorName">
                      Your Name (Optional)
                    </Label>
                    <Input
                      id="contributorName"
                      placeholder="Enter your name"
                      value={formData.contributorName}
                      onChange={(e) =>
                        updateFormData("contributorName", e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Summary */}
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Submission Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Institution:</strong> {formData.institutionName}
                    </div>
                    <div>
                      <strong>Type:</strong> {formData.institutionType}
                    </div>
                    <div>
                      <strong>State:</strong> {formData.state}
                    </div>
                    <div>
                      <strong>Course:</strong> {formData.courseName}
                    </div>
                    <div>
                      <strong>O'Level Subjects:</strong>{" "}
                      {formData.olevelSubjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="mr-1"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="p-6 pt-0">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Submit Information</Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
