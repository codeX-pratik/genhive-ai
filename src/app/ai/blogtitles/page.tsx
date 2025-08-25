"use client";
import { Input } from "@/components/ui/input";
import { Hash, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BlogTitles() {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Travel",
    "Food",
    "Sports",
    "Music",
  ];

  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0]);
  const [input, setInput] = useState("");

  const oneSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6 text-foreground">
        {/* left col - Form */}
        <form
          onSubmit={oneSubmitHandler}
          className="w-full lg:max-w-lg p-6 bg-card rounded-xl border border-border shadow-lg 
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-xl font-semibold">AI Title Generator</h1>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Keyword</label>
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 text-sm rounded-lg border border-border bg-background
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400
                         transition-all duration-200"
              placeholder="The future of artificial intelligence is ..."
              required
            />
          </div>

          {/* Category Options */}
          <div>
            <label className="block text-sm font-medium mb-3">Category</label>
            <div className="flex flex-wrap gap-3">
              {blogCategories.map((item, index) => {
                const isSelected = selectedCategory === item;
                return (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(item)}
                    key={index}
                    className={`
          relative rounded-full transition-all duration-200
          p-[2px] // keeps border consistent
          ${
            isSelected
              ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-md"
              : "bg-border"
          }
        `}
                  >
                    <span
                      className={`
            block rounded-full px-3 py-1.5 text-sm font-medium
            ${
              isSelected
                ? "bg-white text-purple-700 dark:bg-gray-900 dark:text-blue-200"
                : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-gray-800 dark:text-gray-300"
            }
          `}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              className="w-full mt-8 py-3 px-4 text-white font-medium rounded-lg
             transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
             bg-gradient-to-r from-purple-600 to-blue-600
             hover:from-purple-700 hover:to-blue-700
             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
             dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-800 dark:hover:to-blue-800"
            >
              <Hash className="w-4 mr-2" />
              Generate Titles
            </Button>
          </div>
        </form>

        {/* right col - Placeholder for generated content */}
        <div
          className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
             dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
             min-h-[400px] flex justify-center items-center"
        >
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6">
            <Hash className="w-10 h-10 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Titles Yet</h2>
              <p>
                Enter a keyword and click &quot;Generate Titles&quot; to get
                started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
