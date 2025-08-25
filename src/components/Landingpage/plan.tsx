import { PricingTable } from "@clerk/nextjs";

export default function Plan() {
  return (
    <div className="max-w-6xl mx-auto z-20 my-30 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-foreground text-3xl sm:text-4xl lg:text-[42px] font-semibold">
          Choose your Plan
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mt-4 text-sm sm:text-base">
          Start for free and scale up as you grow. Find the perfect plan for
          your content creation needs.
        </p>
      </div>
      <div className="mt-14 max-sm:mt-8">
        <PricingTable />
      </div>
    </div>
  );
}