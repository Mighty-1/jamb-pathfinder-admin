import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, School, MapPin, BookOpen, Users, Send } from "lucide-react";
import { SubjectSelector } from "./SubjectSelector";
import { nigerianStates, institutionTypes, olevelSubjects, jambSubjects } from "../data/formData";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  institutionName: string;
  institutionType: string;
  state: string;
  courseName: string;
  olevelCompulsory: string[];
  olevelOptional: string[];
  jambCompulsory: string[];
  jambOptional: string[];
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
    olevelCompulsory: [],
    olevelOptional: [],
    jambCompulsory: [],
    jambOptional: [],
    contributorName: "",
    isAnonymous: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.institutionName && formData.institutionType && formData.state);
      case 2:
        return !!formData.courseName;
      case 3:
        return formData.olevelCompulsory.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    // Simulate submission
    setIsSubmitted(true);
    toast({
      title: "Submission Successful!",
      description: "Thank you for contributing to the course database.",
      variant: "default",
    });
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                Your course information has been submitted successfully. 
                Thank you for helping fellow students!
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
                  olevelCompulsory: [],
                  olevelOptional: [],
                  jambCompulsory: [],
                  jambOptional: [],
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
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <School className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Course Information Hub</h1>
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
              {currentStep === 1 && <><School className="w-5 h-5" /> Institution Details</>}
              {currentStep === 2 && <><BookOpen className="w-5 h-5" /> Course Information</>}
              {currentStep === 3 && <><Users className="w-5 h-5" /> Subject Requirements</>}
              {currentStep === 4 && <><Send className="w-5 h-5" /> Final Details</>}
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
                    onChange={(e) => updateFormData("institutionName", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="institutionType">Institution Type</Label>
                  <Select value={formData.institutionType} onValueChange={(value) => updateFormData("institutionType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
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
                    onChange={(e) => updateFormData("courseName", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Subject Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">O'Level Requirements</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Compulsory Subjects</Label>
                      <SubjectSelector
                        subjects={olevelSubjects}
                        selected={formData.olevelCompulsory}
                        onChange={(subjects) => updateFormData("olevelCompulsory", subjects)}
                        placeholder="Select compulsory O'Level subjects"
                      />
                    </div>
                    <div>
                      <Label>Optional Subjects</Label>
                      <SubjectSelector
                        subjects={olevelSubjects}
                        selected={formData.olevelOptional}
                        onChange={(subjects) => updateFormData("olevelOptional", subjects)}
                        placeholder="Select optional O'Level subjects"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">JAMB Requirements</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Compulsory Subjects</Label>
                      <SubjectSelector
                        subjects={jambSubjects}
                        selected={formData.jambCompulsory}
                        onChange={(subjects) => updateFormData("jambCompulsory", subjects)}
                        placeholder="Select compulsory JAMB subjects"
                      />
                    </div>
                    <div>
                      <Label>Optional Subjects</Label>
                      <SubjectSelector
                        subjects={jambSubjects}
                        selected={formData.jambOptional}
                        onChange={(subjects) => updateFormData("jambOptional", subjects)}
                        placeholder="Select optional JAMB subjects"
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
                    onChange={(e) => updateFormData("isAnonymous", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="anonymous" className="text-sm">Submit anonymously</Label>
                </div>

                {!formData.isAnonymous && (
                  <div>
                    <Label htmlFor="contributorName">Your Name (Optional)</Label>
                    <Input
                      id="contributorName"
                      placeholder="Enter your name"
                      value={formData.contributorName}
                      onChange={(e) => updateFormData("contributorName", e.target.value)}
                    />
                  </div>
                )}

                {/* Summary */}
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Submission Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Institution:</strong> {formData.institutionName}</div>
                    <div><strong>Type:</strong> {formData.institutionType}</div>
                    <div><strong>State:</strong> {formData.state}</div>
                    <div><strong>Course:</strong> {formData.courseName}</div>
                    <div>
                      <strong>O'Level Compulsory:</strong>{" "}
                      {formData.olevelCompulsory.map(subject => (
                        <Badge key={subject} variant="secondary" className="mr-1">{subject}</Badge>
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
                <Button onClick={handleSubmit}>
                  Submit Information
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}