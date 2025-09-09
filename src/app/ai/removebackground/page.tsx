"use client";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, ImageMinus, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/lib/hooks/use-toast";
import Image from "next/image";

export default function RemoveBackground() {
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [resultImage, setResultImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => { setPreview(e.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) { toast({ title: "Authentication Required", description: "Please sign in to remove backgrounds from images.", variant: "destructive" }); return; }
    if (!selectedFile) { toast({ title: "Input Required", description: "Please select an image to remove the background from.", variant: "destructive" }); return; }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('userId', user.id);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch('/api/removebackground', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) { throw new Error(data.error || 'Failed to remove background'); }

      if (data.success && data.data) {
        setResultImage(data.data.imageUrl);
        const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';
        toast({ title: "Background Removed!", description: isTestMode ? 'Generated successfully in preview mode.' : 'The background has been successfully removed from your image.' });
      } else {
        throw new Error(data.error || 'Failed to remove background');
      }
    } catch (error) {
      toast({ title: "Removal Failed", description: error instanceof Error ? error.message : 'Failed to remove background', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 text-foreground">
      {/* Left Column - Form */}
      <form onSubmit={handleSubmit} className="w-full lg:max-w-lg p-6 bg-card rounded-xl border border-border shadow-lg 
                   dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">AI Background Remover</h1>
        </div>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Choose an Image</label>
          <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 text-sm rounded-lg border border-border bg-background
                       dark:bg-gray-800 dark:border-gray-600 transition-all duration-200" required />
        </div>

        {/* Public Toggle */}
        <div className="mb-6 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Make Public</span>
            <span className="text-xs text-muted-foreground">(Visible in community gallery)</span>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-pink-500" />
        </div>

        {/* Generate Button */}
        <Button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 text-white font-medium rounded-lg
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                     hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
                     focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {isLoading ? (<Loader2 className="w-4 mr-2 text-white animate-spin" />) : (<ImageMinus className="w-4 mr-2 text-white" />)}
          {isLoading ? "Removing Background..." : "Remove Background"}
        </Button>
      </form>

      {/* Right Column - Preview and Result */}
      <div className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
                     h-full flex flex-col">
        {resultImage ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col justify-center items-center gap-6 h-full">
              <h2 className="text-xl font-semibold text-center">Background Removed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {preview && (
                  <div className="text-center">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Original</h3>
                    <div className="relative w-full h-[200px]">
                      <Image src={preview} alt="Original Image" fill className="object-contain rounded-lg border border-border shadow-md" />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Result</h3>
                  <div className="relative w-full h-[200px]">
                    <Image src={resultImage} alt="Background Removed" fill className="object-contain rounded-lg border border-border shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : preview ? (
          <div className="flex-1 overflow-y-auto flex justify-center items-center">
            <div className="relative w-full max-w-md h-[300px]">
              <Image src={preview} alt="Uploaded Preview" fill className="object-contain rounded-lg border border-border shadow-md" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center text-muted-foreground gap-4 h-full">
            <ImageMinus className="w-10 h-10 text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Image Uploaded</h2>
              <p>Upload an image and AI will remove its background.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}