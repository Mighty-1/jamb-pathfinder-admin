import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubjectCombinationAdmin from "./pages/SubjectCombinationAdmin";
import NotFound from "./pages/NotFound";
import AllData from "./components/AllData";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProtectedRoute from "./pages/protectedRoute";
import { CourseSubmissionForm } from "./components/CourseSubmissionForm";
// import { DayPickerProvider } from "react-day-picker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <DayPickerProvider initialProps={{}}> */}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject-combination"
            element={<SubjectCombinationAdmin />}
          />
          <Route path="/all-data" element={<AllData />} />
          <Route path="/signin" element={<Auth />} />
          <Route path="/add-course" element={<CourseSubmissionForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* </DayPickerProvider> */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
