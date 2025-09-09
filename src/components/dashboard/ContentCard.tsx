"use client";
import { Eye, Trash2, FileText, Hash, Image as ImageIcon, Sparkle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface RecentCreation {
  id: string;
  action_type: string;
  input_params: Record<string, unknown>;
  content?: string;
  image_url?: string;
  created_at: string;
  status: string;
  model_used?: string;
  processing_time_ms?: number;
}

interface ContentCardProps {
  creation: RecentCreation;
  onView: (creation: RecentCreation) => void;
  onDelete: (id: string) => void;
  variant?: 'default' | 'compact' | 'image';
}

export function ContentCard({ creation, onView, onDelete, variant = 'default' }: ContentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(creation.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getContentIcon = () => {
    switch (creation.action_type) {
      case 'article':
        return <FileText className="w-4 h-4 text-white" />;
      case 'blog_title':
        return <Hash className="w-4 h-4 text-white" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-white" />;
      case 'resume_review':
        return <FileText className="w-4 h-4 text-white" />;
      default:
        return <Sparkle className="w-4 h-4 text-white" />;
    }
  };

  const getContentTitle = () => {
    switch (creation.action_type) {
      case 'article':
        return creation.input_params?.topic as string || 'Generated Article';
      case 'blog_title':
        return creation.input_params?.keyword as string || 'Generated Blog Titles';
      case 'image':
        return creation.input_params?.prompt as string || 'Generated Image';
      case 'resume_review':
        return (creation.input_params?.fileName as string) || 'Resume Review';
      default:
        return creation.action_type.replace('_', ' ');
    }
  };

  const renderDeleteConfirmationDialog = () => {
    if (!showDeleteConfirm) return null;
    
    return (
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
            Are you sure you want to delete this {creation.action_type.replace('_', ' ')}? 
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
    );
  };

  if (variant === 'compact') {
    return (
      <>
        <div className="group p-2 lg:p-3 bg-background rounded-lg border hover:shadow-sm transition-all duration-200">
          <div className="flex items-start gap-2 lg:gap-3">
            <div className="flex-shrink-0">
              {creation.image_url ? (
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg overflow-hidden">
                  <Image
                    src={creation.image_url}
                    alt={creation.action_type === 'image' ? creation.input_params?.prompt as string : 'Generated content'}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-[#00ad25] to-green-600 flex items-center justify-center">
                  {getContentIcon()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-foreground truncate mb-0.5 lg:mb-1">
                {getContentTitle()}
              </h4>
              <p className="text-xs text-muted-foreground capitalize mb-0.5 lg:mb-1">
                {creation.action_type.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(creation.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-0.5 lg:gap-1">
                <Button
                  onClick={() => onView(creation)}
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 lg:h-6 lg:w-6 p-0"
                >
                  <Eye className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 lg:h-6 lg:w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {renderDeleteConfirmationDialog()}
      </>
    );
  }

  if (variant === 'image') {
    return (
      <>
        <div className="group p-4 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
          <div className="relative mb-3">
            {creation.image_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={creation.image_url}
                  alt={creation.input_params?.prompt as string || 'Generated image'}
                  width={200}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => onView(creation)}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
                disabled={isDeleting}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground truncate mb-1">
              {getContentTitle()}
            </h4>
            <p className="text-xs text-muted-foreground">
              {new Date(creation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {renderDeleteConfirmationDialog()}
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className="group p-4 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate mb-1">
              {getContentTitle()}
            </h4>
            <p className="text-xs text-muted-foreground">
              {new Date(creation.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={() => onView(creation)}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={isDeleting}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {creation.action_type === 'article' ? (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {creation.content?.substring(0, 100)}...
          </p>
        ) : null}
        {creation.action_type === 'blog_title' ? (
          <div className="text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
              {(creation.input_params?.category as string) || 'General'}
            </span>
            <span className="ml-2">
              {creation.content?.split('\n').filter(t => t.trim()).length || 0} titles
            </span>
          </div>
        ) : null}
        {creation.action_type === 'resume_review' ? (
          <div className="text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400">
              Resume
            </span>
            <span className="ml-2">
              {(creation.input_params?.fileName as string) || 'Uploaded PDF'}
            </span>
          </div>
        ) : null}
      </div>
      {renderDeleteConfirmationDialog()}
    </>
  );
}