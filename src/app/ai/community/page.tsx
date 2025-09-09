"use client";

import { useUser } from "@clerk/nextjs";
import { Heart, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/use-toast";

interface PublicImage {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
  };
  likesCount: number;
  liked: boolean;
}

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [images, setImages] = useState<PublicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());

  // Fetch public images
  useEffect(() => {
    const fetchPublicImages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/public/images', {
          headers: user ? { Authorization: `Bearer ${user.id}` } : undefined,
        });
        const data = await response.json();

        if (data.success) {
          const imgs: PublicImage[] = data.data.images;
          setImages(imgs);
          setLikedImages(new Set(imgs.filter(i => i.liked).map(i => i.id)));
        } else {
          throw new Error(data.error || 'Failed to fetch public images');
        }
      } catch (error) {
        console.error('Error fetching public images:', error);
        toast({
          title: "Failed to Load Images",
          description: "Could not load community images. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicImages();
  }, [toast, user]);

  const handleLike = async (imageId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like images.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/public/images/${imageId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const liked = !!result.liked;
        setLikedImages(prev => {
          const newSet = new Set(prev);
          if (liked) newSet.add(imageId); else newSet.delete(imageId);
          return newSet;
        });
        setImages(prev => prev.map(img => img.id === imageId
          ? { ...img, likesCount: Math.max(0, (img.likesCount || 0) + (liked ? 1 : -1)), liked }
          : img
        ));
      }
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 text-foreground">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-card rounded-xl border border-border shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Community Gallery</h1>
            <p className="text-muted-foreground">
              Discover amazing AI-generated images created by our community
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {images.length}
            </div>
            <div className="text-sm text-muted-foreground">Public Images</div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-muted-foreground">Loading community images...</p>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group bg-card rounded-xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.prompt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <button
                    onClick={() => handleLike(image.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 flex items-center gap-1"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        likedImages.has(image.id) 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-600 hover:text-red-500'
                      }`} 
                    />
                    <span className="text-xs font-medium text-foreground">
                      {image.likesCount ?? 0}
                    </span>
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-foreground font-medium mb-2 line-clamp-2">
                    {image.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      {image.style}
                    </span>
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {image.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-muted-foreground">{image.user.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6 h-full">
            <ImageIcon className="w-16 h-16 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold mb-2">No Images Yet</h2>
              <p>Be the first to share your AI-generated images with the community!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}