import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <div>
      <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-border pb-6">
          <div className="md:max-w-96">
            <div className="flex items-center cursor-pointer">
              <Image src="/favicon.ico" alt="Logo" width={30} height={30} />
              <span className="text-primary text-xl sm:text-2xl font-bold ml-2">
                Gen Hive
              </span>
            </div>
            <p className="mt-6 text-sm">
              Experience the power of AI with Gen Hive. <br /> Transform your
              content creation with our suite of premium AI tools. Write
              articles, generate images, and more with ease.
            </p>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-start md:justify-end gap-10 lg:gap-20">
            <div>
              <h2 className="font-semibold mb-5 text-foreground">Company</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Home</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">About us</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Contact us</a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">Privacy policy</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-5">
                Subscribe to our newsletter
              </h2>
              <div className="text-sm space-y-2">
                <p>
                  The latest news, articles, and resources, sent to your inbox
                  weekly.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                  <Input
                    className="border border-border placeholder-muted-foreground focus:ring-2 ring-primary outline-none w-full sm:max-w-64 h-9 rounded px-2"
                    type="email"
                    placeholder="Enter your email"
                  />
                  <Button className="bg-blue-500 text-primary-foreground w-full sm:w-24 h-9 rounded cursor-pointer hover:bg-primary/90 transition-colors">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-xs md:text-sm pb-5">
          Copyright 2024 © Gen Hive PrebuiltUI. All Right Reserved.
        </p>
      </footer>
    </div>
  );
}
