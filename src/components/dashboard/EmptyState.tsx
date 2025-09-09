"use client";
import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="bg-card rounded-xl border p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Sparkle className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">No content yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start creating amazing content with our AI tools. Generate articles, blog titles, and images.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => window.location.href = '/ai/writearticle'}>
          Write Article
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/ai/blogtitles'}>
          Generate Titles
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/ai/generateimage'}>
          Create Image
        </Button>
      </div>
    </div>
  );
}
