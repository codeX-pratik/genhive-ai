"use client";
import { X, FileText, Hash, Image as ImageIcon, Sparkle, Copy, Check, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import Image from "next/image";

interface ContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    action_type: string;
    input_params: Record<string, unknown>;
    content?: string;
    image_url?: string;
    created_at: string;
    status: string;
    model_used?: string;
    processing_time_ms?: number;
  } | null;
  onDelete?: (contentId: string) => void;
}

export function ContentViewer({ isOpen, onClose, content, onDelete }: ContentViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  if (!isOpen || !content) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(content.id);
      toast({
        title: "Content Deleted",
        description: "The content has been successfully deleted.",
      });
      onClose();
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete the content. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getContentTitle = () => {
    switch (content.action_type) {
      case 'article':
        return content.input_params?.topic as string || 'Generated Article';
      case 'blog_title':
        return content.input_params?.keyword as string || 'Generated Blog Titles';
      case 'image':
        return content.input_params?.prompt as string || 'Generated Image';
      default:
        return content.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getContentIcon = () => {
    switch (content.action_type) {
      case 'article':
        return <FileText className="w-6 h-6" />;
      case 'blog_title':
        return <Hash className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      default:
        return <Sparkle className="w-6 h-6" />;
    }
  };

  const renderContent = () => {
    switch (content.action_type) {
      case 'article':
        return (
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
              {content.content || 'No content available'}
            </ReactMarkdown>
          </div>
        );

      case 'resume_review': {
        // Parse JSON content and render as Markdown
        let review: {
          overallScore?: number;
          strengths?: string[];
          weaknesses?: string[];
          suggestions?: string[];
          keywordMatch?: string[];
          missingKeywords?: string[];
          summary?: string;
        } = {};
        try {
          review = content.content ? JSON.parse(content.content) : {};
        } catch {
          // If parsing fails, fall back to raw content
        }

        const fileName = (content.input_params?.fileName as string) || 'Resume';
        const createdAt = new Date(content.created_at).toLocaleDateString();

        const mkKeywords = (arr?: string[]) =>
          Array.isArray(arr) && arr.length > 0
            ? arr.map(k => `- \`${k}\``).join('\n')
            : 'None';

        const resumeMarkdown = `## 📄 Summary\n\n${review.summary ?? 'No summary provided.'}\n\n## ✅ Strengths\n\n${Array.isArray(review.strengths) && review.strengths.length > 0 ? review.strengths.map(s => `- ${s}`).join('\n') : 'None'}\n\n## ⚠️ Areas for Improvement\n\n${Array.isArray(review.weaknesses) && review.weaknesses.length > 0 ? review.weaknesses.map(w => `- ${w}`).join('\n') : 'None'}\n\n## 💡 Recommendations\n\n${Array.isArray(review.suggestions) && review.suggestions.length > 0 ? review.suggestions.map(r => `- ${r}`).join('\n') : 'None'}\n\n## 🔍 Keyword Analysis\n\n### Matched\n${mkKeywords(review.keywordMatch)}\n\n### Missing\n${mkKeywords(review.missingKeywords)}\n\n---\n*Generated by GenHive AI Resume Reviewer*`;

        return (
          <div className="max-w-none">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{fileName}</h3>
                <p className="text-xs text-muted-foreground">Reviewed on {createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Overall Score</span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {typeof review.overallScore === 'number' ? `${review.overallScore}/100` : '—'}
                </span>
              </div>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-foreground">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 space-y-1 text-foreground">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">{children}</li>
                  ),
                  code: ({ children }) => (
                    <code className="px-1 py-0.5 rounded bg-muted text-foreground">{children}</code>
                  ),
                }}
              >
                {resumeMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        );
      }

      case 'blog_title':
        const titles = content.content?.split('\n').filter(title => title.trim()) || [];
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Generated Blog Titles</h3>
              <p className="text-muted-foreground">Here are your AI-generated blog titles</p>
            </div>
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div
                  key={index}
                  className="group p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground leading-relaxed">
                        {title}
                      </h4>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            {String((content.input_params as { category?: unknown })?.category ?? 'General')}
                          </span>
                          <span>•</span>
                          <span>{title.split(' ').length} words</span>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(title)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied ? (
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
          </div>
        );

      case 'image':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <Image
                src={content.image_url || ''}
                alt={getContentTitle()}
                width={600}
                height={400}
                className="rounded-xl shadow-2xl border-2 border-border object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    onClick={() => window.open(content.image_url, '_blank')}
                    className="bg-white/90 hover:bg-white text-black font-medium"
                  >
                    View Full Size
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-md space-y-3">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-foreground mb-2">Image Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="font-medium text-foreground">
                      {String((content.input_params as { style?: unknown })?.style ?? 'realistic')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <span className="font-medium text-foreground">
                      {content.input_params?.isPublic ? "🌍 Public" : "🔒 Private"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium text-foreground">1024x1024</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Prompt Used:</h4>
                <p className="text-sm text-muted-foreground italic">
                  &quot;{String((content.input_params as { prompt?: unknown })?.prompt ?? 'No prompt available')}&quot;
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Sparkle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Content Preview</h3>
            <p className="text-muted-foreground">
              {content.content || 'No content available for this item.'}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-xl border shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getContentIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {getContentTitle()}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {content.action_type.replace('_', ' ')} • {new Date(content.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {content.model_used && (
              <span>Generated with {content.model_used}</span>
            )}
            {content.processing_time_ms && (
              <span> • Processed in {content.processing_time_ms}ms</span>
            )}
          </div>
          <div className="flex gap-2">
            {content.content && (
              <Button
                onClick={() => copyToClipboard(content.content || '')}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </>
                )}
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-background rounded-xl border shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Content</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to delete this {content.action_type.replace('_', ' ')}? 
              This will permanently remove it from your dashboard.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                size="sm"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
