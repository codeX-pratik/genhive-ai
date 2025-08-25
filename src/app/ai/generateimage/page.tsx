"use client";
import { Textarea } from "@/components/ui/textarea";
import { Image as Image_icon, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export default function GenerateImage() {
  const imageStyles = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0]);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    // Example placeholder image
    setImageUrl("https://placehold.co/400x250?text=Generated+Image");
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6 text-foreground">
        {/* left col - Form */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full lg:max-w-lg p-6 bg-card rounded-xl border border-border shadow-lg 
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#00ad25]" />
            </div>
            <h1 className="text-xl font-semibold">AI Image Generator</h1>
          </div>

          {/* Textarea Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Describe Your Image
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 text-sm rounded-lg border border-border bg-background
                         focus:ring-2 focus:ring-[#00ad25] focus:border-transparent
                         dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-[#00ad25]
                         transition-all duration-200"
              placeholder="Describe what you want to see in the image..."
              required
              rows={4} // ✅ control height
            />
          </div>

          {/* Style Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Style</label>
            <div className="flex flex-wrap gap-3">
              {imageStyles.map((style, index) => {
                const isSelected = selectedStyle === style;
                return (
                  <button
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    key={index}
                    className={`
                      relative rounded-full transition-all duration-200 p-[2px]
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-[#00ad25] to-green-600 shadow-md"
                          : "bg-border"
                      }
                    `}
                  >
                    <span
                      className={`
                        block rounded-full px-3 py-1.5 text-sm font-medium
                        ${
                          isSelected
                            ? "bg-white text-[#00ad25] dark:bg-gray-900 dark:text-green-300"
                            : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-gray-800 dark:text-gray-300"
                        }
                      `}
                    >
                      {style}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between mb-6">
            <label className="text-sm font-medium">Make Public</label>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="data-[state=checked]:bg-[#00ad25]"
            />
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full mt-2 py-3 px-4 text-white font-medium rounded-lg
             transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
             bg-gradient-to-r from-[#00ad25] to-green-600
             hover:from-green-700 hover:to-green-800
             focus:outline-none focus:ring-2 focus:ring-[#00ad25] focus:ring-offset-2
             dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900"
          >
            <Image_icon className="w-4 mr-2" />
            Generate Image
          </Button>
        </form>

        {/* right col - Generated content */}
        <div
          className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
             dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
             min-h-[400px] flex justify-center items-center"
        >
          {imageUrl ? (
            <div className="flex flex-col justify-center items-center gap-4 text-center">
              <Image
                src={imageUrl}
                alt="Generated"
                width={400}
                height={250}
                className="rounded-lg shadow-lg border border-border object-cover"
              />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Prompt:</span> {input} <br />
                <span className="font-medium">Style:</span> {selectedStyle}{" "}
                <br />
                <span className="font-medium">Visibility:</span>{" "}
                {isPublic ? "🌍 Public" : "🔒 Private"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6">
              <Image_icon className="w-10 h-10 text-[#00ad25]" />
              <div>
                <h2 className="text-lg font-semibold mb-2">No Image Yet</h2>
                <p>
                  Enter a prompt and click &quot;Generate Image&quot; to get
                  started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
