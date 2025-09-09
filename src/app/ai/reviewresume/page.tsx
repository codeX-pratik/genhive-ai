"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText, Trash2, Download, AlertTriangle, Eye, FileText as MarkdownIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/lib/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ResumeReview {
  id: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordMatch: string[];
  missingKeywords: string[];
  summary: string;
  createdAt: string;
  fileName: string;
}

export default function ReviewResume() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<ResumeReview[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'markdown'>('structured');

  const loadReviewHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/user/activities`, {
        headers: { 'Authorization': `Bearer ${user?.id || ''}` },
      });
      const data = await response.json();
      
      if (data.success && data.activities) {
        const reviews = data.activities.map((activity: unknown) => {
          const a = activity as { id: string; content: string; created_at: string; input_params?: { fileName?: string } };
          return { id: a.id, ...JSON.parse(a.content), createdAt: a.created_at, fileName: a.input_params?.fileName || 'Unknown' } as ResumeReview;
        });
        setReviewHistory(reviews);
      }
    } catch {
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => { if (user) { loadReviewHistory(); } }, [user, loadReviewHistory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') { toast({ title: "Invalid File Type", description: "Please select a PDF file.", variant: "destructive" }); return; }
      if (file.size === 0) { toast({ title: "Empty File", description: "The selected file is empty.", variant: "destructive" }); return; }
      if (file.size > 10 * 1024 * 1024) { toast({ title: "File Too Large", description: "File size must be less than 10MB.", variant: "destructive" }); return; }
      setSelectedFile(file);
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 95) { currentProgress = 95; clearInterval(interval); }
      setProgress(currentProgress);
    }, 200);
    return interval;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) { toast({ title: "Authentication Required", description: "Please sign in to review your resume.", variant: "destructive" }); return; }
    if (!selectedFile) { toast({ title: "Input Required", description: "Please select a PDF file to review.", variant: "destructive" }); return; }

    setIsLoading(true);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', user.id);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());
      if (targetRole.trim()) formData.append('targetRole', targetRole.trim());

      const response = await fetch('/api/reviewresume', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to review resume');

      if (data.success && data.review) {
        setProgress(100);
        setTimeout(() => {
          const newReview: ResumeReview = { id: Date.now().toString(), ...data.review, createdAt: new Date().toISOString(), fileName: selectedFile.name };
          setReview(newReview);
          setReviewHistory(prev => [newReview, ...prev]);
          const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';
          toast({ title: "Resume Reviewed!", description: isTestMode ? 'Generated successfully in preview mode.' : 'Your resume has been analyzed successfully.' });
        }, 500);
        setSelectedFile(null);
        setJobDescription("");
        setTargetRole("");
      } else {
        throw new Error(data.error || 'No review generated');
      }
    } catch (error) {
      toast({ title: "Review Failed", description: error instanceof Error ? error.message : 'Failed to review resume', variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;
    setIsDeleting(true);
    try {
      setReview(null);
      setReviewHistory(prev => prev.filter(r => r.id !== review.id));
      toast({ title: "Review Deleted", description: "The resume review has been removed." });
    } catch {
      toast({ title: "Delete Failed", description: "Could not delete the review. Please try again.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const generateMarkdown = (review: ResumeReview) => {
    return `# Resume Review Report\n\n**File:** ${review.fileName}  \n**Date:** ${new Date(review.createdAt).toLocaleDateString()}  \n**Overall Score:** ${review.overallScore}/100${targetRole ? `\\n**Target Role:** ${targetRole}` : ''}\n\n## 📊 Overall Assessment\n\n${review.summary}\n\n## ✅ Strengths\n\n${review.strengths.map(strength => `- ${strength}`).join('\\n')}\n\n## ⚠️ Areas for Improvement\n\n${review.weaknesses.map(weakness => `- ${weakness}`).join('\\n')}\n\n## 💡 Recommendations\n\n${review.suggestions.map(suggestion => `- ${suggestion}`).join('\\n')}\n\n## 🔍 Keyword Analysis\n\n### Matched Keywords\n${review.keywordMatch.length > 0 ? review.keywordMatch.map(keyword => `- ${keyword}`).join('\\n') : 'No keywords matched'}\n\n### Missing Keywords\n${review.missingKeywords.length > 0 ? review.missingKeywords.map(keyword => `- ${keyword}`).join('\\n') : 'All relevant keywords present'}\n\n---\n*Generated by GenHive AI Resume Reviewer*`;
  };

  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 text-foreground">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 text-foreground">$1</li>')
      .replace(/^---$/gim, '<hr class="my-6 border-border">')
      .replace(/\n\n/gim, '</p><p class="mb-4 text-foreground">')
      .replace(/^(?!<[h|l|p|r])/gim, '<p class="mb-4 text-foreground">')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
      .replace(/<p class="mb-4 text-foreground"><\/p>/gim, '');
  };

  const handleViewHistory = (reviewItem: ResumeReview) => {
    setReview(reviewItem);
    setSelectedFile(null);
  };

  const handleDownloadReview = () => {
    if (!review) return;
    const reviewText = generateMarkdown(review);
    const blob = new Blob([reviewText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-review-${review.fileName.replace('.pdf', '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#00ad25]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Resume Reviewer</h1>
              <p className="text-muted-foreground text-sm">Get professional feedback on your resume with AI-powered analysis</p>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-140px)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column - Upload Form */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-2">
                <form onSubmit={handleSubmit} className="p-6 bg-card rounded-xl border border-border shadow-lg dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Sparkles className="w-5 h-5 text-[#00ad25]" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Upload Resume</h2>
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Upload Resume (PDF only)</label>
                    <Input type="file" accept=".pdf" onChange={handleFileChange} required className="w-full p-2 text-sm rounded-lg border border-border bg-background
                      focus:ring-2 focus:ring-[#00ad25] focus:border-transparent
                      dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-[#00ad25]
                      transition-all duration-200" />
                    <p className="text-xs text-muted-foreground mt-2">
                      📄 Supported: Text-based PDFs (not image-based or password-protected)
                      <br />📏 Maximum size: 10MB
                    </p>
                  </div>

                  {/* Job Description (Optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Job Description (Optional)</label>
                    <Textarea placeholder="Paste the job description here to get targeted feedback..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full p-3 text-sm rounded-lg border border-border bg-background
                      focus:ring-2 focus:ring-[#00ad25] focus:border-transparent
                      dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-[#00ad25]
                      transition-all duration-200 resize-none" rows={4} />
                    <p className="text-xs text-muted-foreground mt-2">💡 Adding a job description helps provide more targeted feedback and keyword analysis</p>
                  </div>

                  {/* Target Role (Optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Target Role (Optional)</label>
                    <Input type="text" placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst..." value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full p-3 text-sm rounded-lg border border-border bg-background
                      focus:ring-2 focus:ring-[#00ad25] focus:border-transparent
                      dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-[#00ad25]
                      transition-all duration-200" />
                    <p className="text-xs text-muted-foreground mt-2">🎯 Specify the role you&apos;re applying for to get more targeted feedback</p>
                  </div>

                  {/* Progress Bar */}
                  {isLoading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Analyzing resume...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-auto space-y-3">
                    <Button type="submit" disabled={isLoading || !selectedFile} className="w-full mt-2 py-3 px-4 text-white font-medium rounded-lg
                      transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                      bg-gradient-to-r from-[#00ad25] to-green-600
                      hover:from-green-700 hover:to-green-800
                      focus:outline-none focus:ring-2 focus:ring-[#00ad25] focus:ring-offset-2
                      dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {isLoading ? "Analyzing Resume..." : "Review Resume"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Review History */}
              {(isLoadingHistory || reviewHistory.length > 0) && (
                <div className="mt-4 p-4 bg-card rounded-xl border border-border shadow-lg dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-3">Recent Reviews</h3>
                  {isLoadingHistory ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {reviewHistory.slice(0, 5).map((reviewItem) => (
                        <div key={reviewItem.id} onClick={() => handleViewHistory(reviewItem)} className="p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{reviewItem.fileName}</span>
                            <span className="text-xs text-muted-foreground">{new Date(reviewItem.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`${getScoreColor(reviewItem.overallScore)} text-xs font-medium`}>{reviewItem.overallScore}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Review Results */}
            <div className="w-full flex-1 bg-card rounded-xl border border-border shadow-lg dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700 h-full flex flex-col overflow-hidden">
              {review ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="h-full">
                    {/* Review Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold">Resume Review</h2>
                        <p className="text-sm text-muted-foreground">{review.fileName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadReview}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="mb-6 flex items-center justify-center">
                      <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button
                          variant={viewMode === 'structured' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('structured')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Structured
                        </Button>
                        <Button
                          variant={viewMode === 'markdown' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('markdown')}
                          className="flex items-center gap-2"
                        >
                          <MarkdownIcon className="w-4 h-4" />
                          Markdown
                        </Button>
                      </div>
                    </div>

                    {/* Overall Score */}
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Overall Score</h3>
                        <span className={`text-2xl font-bold ${getScoreColor(review.overallScore)}`}>
                          {review.overallScore}/100
                        </span>
                      </div>
                      <Progress value={review.overallScore} className="h-3" />
                    </div>

                    {/* Review Content */}
                    {viewMode === 'structured' ? (
                      <div className="space-y-6">
                        {/* Strengths */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                            Strengths
                          </h3>
                          <ul className="space-y-2">
                            {review.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span className="text-foreground">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                            Areas for Improvement
                          </h3>
                          <ul className="space-y-2">
                            {review.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-red-500 mt-1">⚠</span>
                                <span className="text-foreground">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggestions */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                            Recommendations
                          </h3>
                          <ul className="space-y-2">
                            {review.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">💡</span>
                                <span className="text-foreground">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Keywords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                              Matched Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {review.keywordMatch.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                              Missing Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {review.missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="border-red-300 text-red-600 dark:border-red-700 dark:text-red-400">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Summary</h3>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="text-foreground leading-relaxed">{review.summary}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-6 bg-muted/30 rounded-lg prose prose-slate dark:prose-invert max-w-none">
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: renderMarkdown(generateMarkdown(review)) 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-4 h-full p-6">
                  <FileText className="w-10 h-10 text-[#00da83]" />
                  <div>
                    <h2 className="text-lg font-semibold mb-2">No Resume Uploaded</h2>
                    <p>Upload a PDF resume to get AI-powered feedback and suggestions.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card p-6 rounded-xl border border-border shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Review</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-foreground mb-6">Are you sure you want to delete this resume review? This will permanently remove the review from your history.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteReview} disabled={isDeleting}>
                {isDeleting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>) : 'Delete Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}