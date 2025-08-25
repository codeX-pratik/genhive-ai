"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { tools } from "@/lib/asset";

export default function AITools() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      <div className="text-center">
        <h2 className="text-slate-700 dark:text-slate-100 text-[42px] font-semibold">
          Powerful AI Tools
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Everything you need to create, enhance, and optimize your content with
          cutting-edge AI technology.
        </p>
      </div>

      <div className="flex flex-wrap justify-center mt-10">
        {tools.map((tool, index) => (
          <div
            key={index}
            className="p-8 m-4 max-w-xs rounded-lg 
                       bg-[#fdfdfe] dark:bg-slate-800 
                       shadow-lg border border-gray-100 dark:border-slate-700 
                       hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => user && router.push(tool.path)}
          >
            <tool.Icon
              className={`w-12 h-12 p-3 text-white rounded-xl ${tool.bgColor}`}
            />

            <h3 className="mt-6 mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              {tool.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[95%]">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
