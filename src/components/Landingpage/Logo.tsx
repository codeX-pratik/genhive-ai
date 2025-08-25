import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => router.push("/")}
    >
      <Image src="/favicon.ico" alt="Logo" width={30} height={30} />
      <span className="text-yellow-500 text-xl sm:text-2xl font-bold ml-2">
        Gen Hive
      </span>
    </div>
  );
}
