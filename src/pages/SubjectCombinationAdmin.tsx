import { Card, CardTitle } from "@/components/ui/card";
import { BookOpen, School } from "lucide-react";
import { Link } from "react-router-dom";

const SubjectCombinationAdmin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
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
        {/* Action Buttons */}
        <Card className="bg-background/80 backdrop-blur-md shadow-lg p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-4">
            <CardTitle
              className="flex-1 bg-accent/50 flex items-center gap-4 rounded-2xl
                 border-2 border-gray-200
                 hover:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300/40
                 hover:shadow-lg transform hover:-translate-y-0.5
                 transition-all duration-200 ease-out
                 p-6 sm:p-8 md:p-10"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-4">
                <School className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    View All Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Browse submitted course requirements
                  </p>
                </div>
              </div>

              <Link
                to="/all-data"
                className="ml-auto inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                   bg-white/10 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Open
              </Link>
            </CardTitle>

            <CardTitle
              className="flex-1 bg-accent/50 flex items-center gap-4 rounded-2xl
                 border-2 border-gray-200
                 hover:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300/40
                 hover:shadow-lg transform hover:-translate-y-0.5
                 transition-all duration-200 ease-out
                 p-6 sm:p-8 md:p-10"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Add Course
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Share a new course requirement
                  </p>
                </div>
              </div>

              <Link
                to="/add-course"
                className="ml-auto inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                   bg-white/10 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Add
              </Link>
            </CardTitle>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubjectCombinationAdmin;
