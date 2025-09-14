import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubjectCombinationAdmin from "./pages/SubjectCombinationAdmin";
import NotFound from "./pages/NotFound";
import AllData from "./components/AllData";
import Index from "./pages/Index";
import { CourseSubmissionForm } from "./components/CourseSubmissionForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/subject-combination" element={<SubjectCombinationAdmin/>}/>
          <Route path="/all-data" element={<AllData />} />
          <Route path="/add-course" element={<CourseSubmissionForm />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
