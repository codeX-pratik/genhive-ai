"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import Markdown from "react-markdown";

type CreationItemProps = {
  item: {
    prompt: string;
    type: string;
    createdAt: string | number | Date;
    content: string;
  };
};

export default function CreationItem({ item }: CreationItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-card border border-border rounded-lg cursor-pointer transition-colors hover:bg-accent/5"
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="font-medium text-foreground">{item.prompt}</h2>
          <p className="text-muted-foreground text-xs mt-1">
            {item.type} - {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          {item.type === "image" ? (
            <div className="flex justify-center">
              <Image
                src={item.content}
                alt="Generated content"
                width={400}
                height={400}
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-md max-h-100 overflow-y-auto">
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}