"use client";
import { Input } from "@/components/ui/input";
import { Edit, Sparkle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function WriteArticle() {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sparkle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-xl font-semibold">AI Article Configuration</h1>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Article Topic
            </label>
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

          {/* Article Length Options */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Article Length
            </label>
            <div className="flex flex-wrap gap-3">
              {articleLength.map((item, index) => (
                <Button
                  type="button"
                  onClick={() => setSelectedLength(item)}
                  key={index}
                  className={`px-4 py-2.5 text-sm font-medium rounded-full border-2 transition-all duration-200
                    ${
                      selectedLength.text === item.text
                        ? "bg-blue-100 text-blue-800 border-blue-400 shadow-sm dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600 dark:shadow-blue-900/30"
                        : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                >
                  {item.text}
                </Button>
              ))}
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              className="w-full mt-8 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                         transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                         dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-blue-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Edit className="w-4 mr-2" />
              Generate Article
            </Button>
          </div>
        </form>

        <div
          className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
             dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
             min-h-[400px] flex justify-center items-center"
        >
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6">
            <Edit className="w-10 h-10 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Article Yet</h2>
              <p>
                Enter a topic and click &quot;Generate Article&quot; to get
                started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
