"use client";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React, { useState } from "react";


export default function UpLoad() {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-screen">
      {/* Sidebar - Only visible on md+ screens */}
      <div className="hidden md:block col-span-1">
        <div>something here!</div>
      </div>

      {/* Main Content - Uploads & Image Display */}
      <main className="col-span-3 flex flex-col items-center gap-4 w-full px-4">
        <h1 className="text-2xl font-semibold">Upload Images</h1>

        {/* Upload Buttons */}
        <div className="flex flex-col md:flex-row gap-7 md:gap-20 mt-4">
          {/* Thumbnail Upload */}
          <div className="flex flex-col items-center">
            <CldUploadButton
              uploadPreset="xpbhz3av"
              onSuccess={(result: any) => {
                if (result.info?.public_id) {
                  setThumbnail(result.info.public_id);
                }
              }}
            />
            <p className="text-sm text-gray-600">Upload Thumbnail</p>
          </div>

          {/* General Images Upload */}
          <div className="flex flex-col items-center">
            <CldUploadButton
              uploadPreset="xpbhz3av"
              onSuccess={(result: any) => {
                if (result.info?.public_id) {
                  setImages((prev) => [...prev, result.info.public_id]);
                }
              }}
            />
            <p className="text-sm text-gray-600">Upload Other Images</p>
          </div>
        </div>

        {/* Display Thumbnail */}
        {thumbnail && (
          <div className="mt-4">
            <h2 className="text-lg font-medium">Thumbnail</h2>
            <CldImage
              width="200"
              height="150"
              src={thumbnail}
              sizes="100vw"
              alt="Thumbnail"
              className="rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Display Other Uploaded Images */}
        {images.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-medium">Other listings</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <CldImage
                  key={index}
                  width="200"
                  height="150"
                  src={img}
                  sizes="100vw"
                  alt={`Uploaded Image ${index + 1}`}
                  className="rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
