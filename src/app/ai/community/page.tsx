"use client";

import { PublishedCreation, dummyPublishedCreationData } from "@/lib/asset";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type CommunityCreation = PublishedCreation & { liked: boolean };

export default function Community() {
  const [creations, setCreations] = useState<CommunityCreation[]>([]);
  const { user } = useUser();

  // Initialize creations and liked state
  useEffect(() => {
    if (!user) return;

    const updatedCreations = dummyPublishedCreationData.map((c) => ({
      ...c,
      liked: c.likes.includes(user.id),
    }));

    setCreations(updatedCreations);
  }, [user]);

  // Toggle like/unlike
  const toggleLike = (index: number) => {
    if (!user) return;

    setCreations((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;

        const hasLiked = c.likes.includes(user.id);
        return {
          ...c,
          liked: !hasLiked,
          likes: hasLiked
            ? c.likes.filter((id) => id !== user.id)
            : [...c.likes, user.id],
        };
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 ">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Creations</h2>

      <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {creations.map((creation, index) => (
            <div
              key={creation.id}
              className="relative group rounded-lg overflow-hidden shadow-lg dark:shadow-gray-700 transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="relative w-full h-64 sm:h-72 lg:h-80">
                <Image
                  src={creation.content as string}
                  alt={`AI generated image for: ${creation.prompt}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent dark:from-black/60 text-white flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg">
                  <p className="text-sm truncate max-w-[70%]">{creation.prompt}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm">{creation.likes.length}</p>
                    <Heart
                      className={`w-5 h-5 cursor-pointer transition-transform duration-200 ${
                        creation.liked
                          ? "fill-red-500 text-red-600 dark:fill-red-500 dark:text-red-500"
                          : "text-white hover:text-red-500 dark:text-gray-200 dark:hover:text-red-500"
                      }`}
                      onClick={() => toggleLike(index)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
