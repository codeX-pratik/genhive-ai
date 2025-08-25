import { Star } from "lucide-react";
import Image from "next/image";

import { dummyTestimonialData } from "@/lib/asset";


export default function Testimonial() {

  return (
    <div className="px-4 sm:px-20 xl:px-32 py-24">
      <div className="text-center">
        <h2 className="text-foreground text-[42px] font-semibold">
          Loved by Creators
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {`Don't just take our word for it. Here's what our users are saying.`}
        </p>
      </div>

      <div className="flex flex-wrap mt-10 justify-center">
        {dummyTestimonialData.map((testimonial, index) => (
          <div
            key={index}
            className="p-8 m-4 max-w-xs rounded-lg bg-card shadow-lg border border-border hover:-translate-y-1 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"
                  }`}
                />
              ))}
            </div>

            <p className="text-muted-foreground text-sm my-5">{testimonial.content}</p>
            <hr className="mb-5 border-border" />

            <div className="flex items-center gap-4">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={48} 
                height={48} 
                className="object-cover rounded-full"
              />
              <div className="text-sm text-muted-foreground">
                <h3 className="font-medium text-foreground">{testimonial.name}</h3>
                <p className="text-xs text-muted-foreground">{testimonial.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 