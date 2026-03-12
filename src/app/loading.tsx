import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white gap-6">
      <div className="relative w-20 h-20 animate-pulse">
        <Image
          src="/images/logo-hr-one.webp"
          alt="HR-One Donuts"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400">Memuat halaman...</p>
      </div>
    </div>
  );
}
