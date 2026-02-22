"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Image */}
      <div className="w-full aspect-square rounded-xl bg-white dark:bg-slate-900 relative">
        <div className="w-full h-full relative rounded-xl overflow-hidden">
            <Image
              src={activeImage}
              alt="Product detail main view"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
        </div>
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(img)}
            className={`aspect-square rounded-lg border-2 overflow-hidden bg-white dark:bg-slate-900 transition-all ${
              activeImage === img ? "border-primary" : "border-transparent hover:border-primary/50"
            }`}
          >
            <div className="w-full h-full relative">
              <Image
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
