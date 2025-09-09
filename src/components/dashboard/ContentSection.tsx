"use client";
import { Button } from "@/components/ui/button";
import { ContentCard } from "./ContentCard";

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

interface ContentSectionProps {
  type: 'article' | 'blog_title' | 'image' | 'resume_review';
  title: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  creations: RecentCreation[];
  onView: (creation: RecentCreation) => void;
  onDelete: (id: string) => void;
  createUrl: string;
  gridCols?: string;
}

export function ContentSection({
  type,
  title,
  count,
  description,
  icon,
  iconBg,
  iconColor,
  creations,
  onView,
  onDelete,
  createUrl,
  gridCols = "grid-cols-1 md:grid-cols-2"
}: ContentSectionProps) {
  if (count === 0) return null;

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${iconBg} rounded-lg`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          onClick={() => window.location.href = createUrl}
          size="sm"
          variant="outline"
        >
          Create New
        </Button>
      </div>
      <div className={`grid ${gridCols} gap-4`}>
        {creations.map((creation) => (
          <ContentCard
            key={creation.id}
            creation={creation}
            onView={onView}
            onDelete={onDelete}
            variant={type === 'image' ? 'image' : 'default'}
          />
        ))}
      </div>
    </div>
  );
}
