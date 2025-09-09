"use client";
import { Input } from "@/components/ui/input";
import { Edit, Sparkle, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useArticleGenerator } from "@/lib/hooks/useArticleGenerator";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function WriteArticle() {
  const { user } = useUser();
  const { generateArticle, isLoading } = useArticleGenerator(user?.id || null);

  const articleLength = [
    { length: 500, text: "Short (400-600 words)" },
    { length: 800, text: "Medium (700-900 words)" },
    { length: 1200, text: "Long (1000-1400 words)" },
    { length: 2000, text: "Extended (1800-2200 words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [generationError, setGenerationError] = useState("");

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleGenerateArticle();
  };

  const handleGenerateArticle = async () => {
    if (!input.trim()) {
      setGenerationError("Please enter a topic for your article");
      return;
    }

    setGenerationError("");
    setGeneratedArticle("");

    try {
      const result = await generateArticle({
        topic: input.trim(),
        length: selectedLength.length,
        style: 'professional',
        tone: 'informative'
      });

      if (result.success && result.article) {
        setGeneratedArticle(result.article);
      } else {
        setGenerationError(result.error || "Failed to generate article");
      }
    } catch {
      setGenerationError("An unexpected error occurred");
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 text-foreground">
        {/* left col - Form */}
        <div className="w-full lg:max-w-lg">
          <form
            onSubmit={handleFormSubmit}
            className="p-6 bg-card rounded-xl border border-border shadow-lg 
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
        </div>

        <div
          className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
             dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
             h-full flex flex-col"
        >
          {isLoading ? (
            <div className="flex flex-col justify-center items-center text-center gap-6 h-full">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Generating Article...</h2>
                <p className="text-muted-foreground">
                  Please wait while we create your article
                </p>
              </div>
            </div>
          ) : generationError ? (
            <div className="flex flex-col justify-center items-center text-center gap-6 h-full">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold mb-2 text-red-600">Generation Failed</h2>
                <p className="text-red-500">{generationError}</p>
              </div>
            </div>
          ) : generatedArticle ? (
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mb-4 text-foreground border-b border-border pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold mb-3 mt-6 text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-foreground leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 ml-6 list-disc text-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-6 list-decimal text-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1 text-foreground">
                        {children}
                      </li>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border border-border">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-foreground">
                        {children}
                      </em>
                    ),
                  }}
                >
                  {generatedArticle}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6 h-full">
              <Edit className="w-10 h-10 text-blue-500" />
              <div>
                <h2 className="text-lg font-semibold mb-2">No Article Yet</h2>
                <p>
                  Enter a topic and click &quot;Generate Article&quot; to get
                  started.
                </p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
