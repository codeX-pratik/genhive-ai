"use client";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Image as Image_icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/lib/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export default function GenerateImage() {
  const { user } = useUser();
  const { toast } = useToast();

  const imageStyles = [
    { value: "realistic", label: "Realistic" },
    { value: "anime", label: "Anime" },
    { value: "cartoon", label: "Cartoon" },
    { value: "fantasy", label: "Fantasy" },
    { value: "3d", label: "3D" },
    { value: "portrait", label: "Portrait" },
    { value: "ghibli", label: "Ghibli" },
    { value: "artistic", label: "Artistic" },
  ];

  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0]);
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to generate images.", variant: "destructive" });
      return;
    }

    if (!input.trim()) {
      toast({ title: "Input Required", description: "Please enter a description for your image.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generateimage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.id}` },
        body: JSON.stringify({ prompt: input, style: selectedStyle.value, isPublic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.data) {
        setImageUrl(data.data.imageUrl);
        const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';
        toast({
          title: "Image Generated!",
          description: isTestMode ? 'Generated successfully in preview mode.' : `Your ${isPublic ? 'public' : 'private'} image has been created.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      toast({ title: "Generation Failed", description: error instanceof Error ? error.message : 'Failed to generate image', variant: "destructive" });
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
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Sparkles className="w-5 h-5 text-[#00ad25]" />
          </div>
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        {/* Textarea Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Describe Your Image</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border border-border bg-background
                       focus:ring-2 focus:ring-[#00ad25] focus:border-transparent
                       dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-[#00ad25]
                       transition-all duration-200"
            placeholder="Describe what you want to see in the image..."
            required
            rows={4}
          />
        </div>

        {/* Style Options */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Style</label>
          <div className="flex flex-wrap gap-3">
            {imageStyles.map((style, index) => {
              const isSelected = selectedStyle.value === style.value;
              return (
                <button type="button" onClick={() => setSelectedStyle(style)} key={index} className={`
                    relative rounded-full transition-all duration-200 p-[2px]
                    ${isSelected ? "bg-gradient-to-r from-[#00ad25] to-green-600 shadow-md" : "bg-border"}
                  `}>
                  <span className={`
                      block rounded-full px-3 py-1.5 text-sm font-medium
                      ${isSelected ? "bg-white text-[#00ad25] dark:bg-gray-900 dark:text-green-300" : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-gray-800 dark:text-gray-300"}
                    `}>
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between mb-6">
          <label className="text-sm font-medium">Make Public</label>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-[#00ad25]" />
        </div>

        {/* Generate Button */}
        <Button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 text-white font-medium rounded-lg
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                     bg-gradient-to-r from-[#00ad25] to-green-600
                     hover:from-green-700 hover:to-green-800
                     focus:outline-none focus:ring-2 focus:ring-[#00ad25] focus:ring-offset-2
                     dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {isLoading ? (<Loader2 className="w-4 mr-2 animate-spin" />) : (<Image_icon className="w-4 mr-2" />)}
          {isLoading ? "Generating..." : "Generate Image"}
        </Button>
      </form>

      {/* Right Column - Generated Content */}
      <div className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
                     h-full flex flex-col">
        {imageUrl ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col justify-center items-center gap-6 text-center h-full">
              <div className="relative group">
                <Image src={imageUrl} alt="Generated" width={500} height={400} className="rounded-xl shadow-2xl border-2 border-border object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button onClick={() => window.open(imageUrl, '_blank')} className="bg-white/90 hover:bg-white text-black font-medium">View Full Size</Button>
                  </div>
                </div>
              </div>
              
              <div className="w-full max-w-md space-y-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-foreground mb-2">Image Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Style:</span><span className="font-medium text-foreground">{selectedStyle.label}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Visibility:</span><span className="font-medium text-foreground">{isPublic ? "🌍 Public" : "🔒 Private"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Size:</span><span className="font-medium text-foreground">1024x1024</span></div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Prompt Used:</h4>
                  <p className="text-sm text-muted-foreground italic">&quot;{input}&quot;</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-6 h-full">
            <Image_icon className="w-10 h-10 text-[#00ad25]" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Image Yet</h2>
              <p>Enter a prompt and click &quot;Generate Image&quot; to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}