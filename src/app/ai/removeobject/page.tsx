"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Scissors, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/lib/hooks/use-toast";
import Image from "next/image";

export default function RemoveObject() {
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [object, setObject] = useState("");
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
    
    if (!user) { toast({ title: "Authentication Required", description: "Please sign in to remove objects from images.", variant: "destructive" }); return; }
    if (!selectedFile || !object.trim()) { toast({ title: "Input Required", description: "Please select an image and describe the object to remove.", variant: "destructive" }); return; }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('objectDescription', object);
      formData.append('userId', user.id);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch('/api/removeobject', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) { throw new Error(data.error || 'Failed to remove object'); }

      if (data.success && data.data) {
        setResultImage(data.data.imageUrl);
        const isTestMode = process.env.NEXT_PUBLIC_TEST_MAX_LIMITS === 'true';
        toast({ title: "Object Removed!", description: isTestMode ? 'Generated successfully in preview mode.' : 'The object has been successfully removed from your image.' });
      } else {
        throw new Error(data.error || 'Failed to remove object');
      }
    } catch (error) {
      toast({ title: "Removal Failed", description: error instanceof Error ? error.message : 'Failed to remove object', variant: "destructive" });
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
          <div className="p-2 bg-[#4a7aff]/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-[#4a7aff]" />
          </div>
          <h1 className="text-xl font-semibold">AI Object Remover</h1>
        </div>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Choose an Image</label>
          <Input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 text-sm rounded-lg border border-border bg-background
                       dark:bg-gray-800 dark:border-gray-600 transition-all duration-200" required />
        </div>

        {/* Object Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Describe Object to Remove</label>
          <Textarea value={object} onChange={(e) => setObject(e.target.value)} placeholder="e.g. Remove the tree on the right side" className="w-full p-2 text-sm rounded-lg border border-border bg-background
                       dark:bg-gray-800 dark:border-gray-600 transition-all duration-200" required />
        </div>

        {/* Public Toggle */}
        <div className="mb-6 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Make Public</span>
            <span className="text-xs text-muted-foreground">(Visible in community gallery)</span>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#4a7aff] data-[state=checked]:to-blue-600" />
        </div>

        {/* Generate Button */}
        <Button type="submit" disabled={isLoading} className="w-full mt-2 py-3 px-4 text-white font-medium rounded-lg
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                     bg-gradient-to-r from-[#4a7aff] to-blue-600
                     hover:from-blue-700 hover:to-blue-800
                     focus:outline-none focus:ring-2 focus:ring-[#4a7aff] focus:ring-offset-2
                     dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {isLoading ? (<Loader2 className="w-4 mr-2 animate-spin" />) : (<Scissors className="w-4 mr-2" />)}
          {isLoading ? "Removing Object..." : "Remove Object"}
        </Button>
      </form>

      {/* Right Column - Preview and Result */}
      <div className="w-full flex-1 p-6 bg-card rounded-xl border border-border shadow-lg
                     dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:border-gray-700
                     h-full flex flex-col">
        {resultImage ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col justify-center items-center gap-6 h-full">
              <h2 className="text-xl font-semibold text-center">Object Removed</h2>
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
                    <Image src={resultImage} alt="Object Removed" fill className="object-contain rounded-lg border border-border shadow-md" />
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
            <Scissors className="w-10 h-10 text-[#4a7aff]" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Image Uploaded</h2>
              <p>Select an image to preview and remove unwanted objects.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}