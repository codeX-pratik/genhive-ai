"use client";
import { Input } from "@/components/ui/input";
import { Hash, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/lib/hooks/use-toast";

export default function BlogTitles() {
  const { user } = useUser();
  const { toast } = useToast();
  
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
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Blog title copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate blog titles.",
        variant: "destructive",
      });
      return;
    }

    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a keyword for your blog titles.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/blogtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          keyword: input,
          category: selectedCategory,
          count: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog titles');
      }

      if (data.success && data.data) {
        setTitles(data.data.titles);
        const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';
        toast({
          title: "Titles Generated!",
          description: isTestMode ? 'Generated successfully in preview mode.' : 'Your blog titles have been created successfully.',
        });
      } else {
        throw new Error(data.error || 'Failed to generate blog titles');
      }
    } catch (error) {
      console.error('Blog titles generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate blog titles',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 text-foreground">
      {/* Left Column - Form */}
      <form
        onSubmit={onSubmitHandler}
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
                    p-[2px]
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
            disabled={isLoading}
            className="w-full mt-8 py-3 px-4 text-white font-medium rounded-lg
                       transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                       bg-gradient-to-r from-purple-600 to-blue-600
                       hover:from-purple-700 hover:to-blue-700
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                       dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-800 dark:hover:to-blue-800
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 mr-2 animate-spin" />
            ) : (
              <Hash className="w-4 mr-2" />
            )}
            {isLoading ? "Generating..." : "Generate Titles"}
          </Button>
        </div>
      </form>

      {/* Right Column - Generated Content */}
      <div className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
                     h-full flex flex-col">
        {titles.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Generated Blog Titles</h2>
                <p className="text-muted-foreground">Here are your AI-generated blog titles</p>
              </div>
              
              <div className="space-y-4">
                {titles.map((title, index) => (
                  <div
                    key={index}
                    className="group p-6 bg-gradient-to-r from-purple-50 to-blue-50 
                               dark:from-purple-900/20 dark:to-blue-900/20 
                               rounded-xl border border-purple-200 dark:border-purple-800 
                               shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 
                                     rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground leading-relaxed 
                                       group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {title}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                              {selectedCategory}
                            </span>
                            <span>•</span>
                            <span>{title.split(' ').length} words</span>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(title, index)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Ready to use! Copy any title that resonates with you.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6">
            <Hash className="w-10 h-10 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Titles Yet</h2>
              <p>
                Enter a keyword and click &quot;Generate Titles&quot; to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}