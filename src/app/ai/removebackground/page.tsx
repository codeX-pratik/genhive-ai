"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImageMinus, Sparkles } from "lucide-react";

export default function RemoveBackground() {
  const [input, setInput] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInput(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    // 🚀 API call for background removal will go here
    console.log("Submitting for background removal:", input.name);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6 text-foreground">
        {/* Left side - Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:max-w-lg p-6 bg-card rounded-xl border border-border shadow-lg 
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold">AI Background Remover</h1>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Choose an Image
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 text-sm rounded-lg border border-border bg-background
                         dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
              required
            />
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full mt-4 py-3 px-4 text-white font-medium rounded-lg
             transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
             hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <ImageMinus className="w-4 mr-2 text-white" />
            Remove Background
          </Button>
        </form>

        {/* Right side - Preview */}
        <div
          className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
                     min-h-[400px] flex justify-center items-center"
        >
          {preview ? (
            <div className="relative w-full max-w-md h-[300px]">
              <Image
                src={preview}
                alt="Uploaded Preview"
                fill
                className="object-contain rounded-lg border border-border shadow-md"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-4">
              <ImageMinus className="w-10 h-10 text-purple-500" />
              <div>
                <h2 className="text-lg font-semibold mb-2">No Image Uploaded</h2>
                <p>Upload an image and AI will remove its background.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
