"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Hero() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const handleStartCreating = () => {
    if (!isLoaded || !user) {
      openSignIn();
      return;
    }
    router.push("/ai");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-cover bg-no-repeat bg-center bg-[url('/gradientBackground.png')]">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]">
          Create amazing content <br /> with{" "}
          <span className="text-blue-500">AI tools</span>
        </h1>
        <p className="mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-500 dark:text-gray-300">
          Transform your content creation with our suite of premium AI tools.
          Write articles, generate images, and more with ease.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs">
        <Button
          onClick={handleStartCreating}
          className="bg-blue-500 text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointe hover:bg-blue-800"
        >
          Start creating now
        </Button>
        <Button className="bg-white text-blue-500 px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer">
          Watch demo
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600 text-sm max-sm:text-xs dark:text-gray-200">
        <Image
          src="/user_group.png"
          alt="user group icon"
          className="h-8"
          width={100}
          height={20}
        />
        Trusted by 10k+ people
      </div>
    </div>
  );
}
