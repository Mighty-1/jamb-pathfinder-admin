import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectSelectorProps {
  subjects: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function SubjectSelector({
  subjects,
  selected,
  onChange,
  placeholder = "Select subjects",
}: SubjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selected.includes(subject)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addSubject = (subject: string) => {
    if (!selected.includes(subject)) {
      onChange([...selected, subject]);
    }
    setSearchTerm("");
  };

  const removeSubject = (subject: string) => {
    onChange(selected.filter((s) => s !== subject));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected subjects display */}
      <div className="min-h-[2.5rem] p-3 border rounded-md bg-card focus-within:ring-2 focus-within:ring-ring">
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((subject) => (
            <Badge key={subject} variant="secondary" className="flex items-center gap-1">
              {subject}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => removeSubject(subject)}
              />
            </Badge>
          ))}
        </div>

        {/* Input field */}
        <div className="flex items-center gap-2">
          <Input
            placeholder={selected.length === 0 ? placeholder : "Add more subjects..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="border-none shadow-none p-0 h-auto focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-auto z-50 bg-popover shadow-soft">
          <div className="p-2">
            {filteredSubjects.length > 0 ? (
              <div className="space-y-1">
                {filteredSubjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-accent transition-colors",
                      "focus:bg-accent focus:outline-none"
                    )}
                    onClick={() => addSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {searchTerm ? `No subjects found for "${searchTerm}"` : "No more subjects available"}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}