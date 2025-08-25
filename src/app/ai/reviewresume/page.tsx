"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, BookText } from "lucide-react";

export default function ReviewResume() {
  const [file, setFile] = useState<File | null>(null);
  const [review, setReview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // TODO: Replace with API call
    setTimeout(() => {
      setReview(
        "✅ Strong technical foundation\n⚠️ Work on project descriptions\n💡 Add measurable achievements"
      );
    }, 1000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="flex flex-col lg:flex-row items-start gap-6 text-foreground">
        {/* Left - Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:max-w-lg p-6 bg-card rounded-xl border border-border shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-[#00da83] to-[#00a3ff]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-[#00da83] to-[#00a3ff] bg-clip-text text-transparent">
              AI Resume Reviewer
            </h1>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Upload Resume (PDF only)
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-white font-medium shadow-md rounded-lg bg-gradient-to-r from-[#00da83] to-[#00a3ff] hover:from-[#00c777] hover:to-[#0088ff] transition-all duration-200"
          >
            <BookText className="w-4 mr-2 text-white" /> Review Resume
          </Button>
        </form>

        {/* Right - Analysis Result */}
        <div className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg min-h-[400px] flex justify-center items-center">
          {file ? (
            <div className="relative w-full max-w-sm h-[250px] border border-dashed rounded-lg p-4 flex flex-col justify-center items-start text-sm">
              {review ? (
                <pre className="whitespace-pre-wrap text-foreground">
                  {review}
                </pre>
              ) : (
                <div className="w-full h-full flex flex-col justify-center items-center text-muted-foreground">
                  <BookText className="w-10 h-10 text-[#00a3ff]" />
                  <p className="mt-2">Resume analysis will appear here</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-4">
              <BookText className="w-10 h-10 text-[#00a3ff]" />
              <p>No resume uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
