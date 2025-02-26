"use client";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React, { useState } from "react";

export default function UpLoad() {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const uploadConfig = {
    sources: ['local', 'camera', 'dropbox', 'google_drive'] as ('local' | 'camera' | 'dropbox' | 'google_drive')[],
    resourceType: 'image',
    styles: {
      palette: {
        window: "#FFFFFF",
        windowBorder: "#90A0B3",
        tabIcon: "#0078FF",
        menuIcons: "#5A616A",
        textDark: "#000000",
        textLight: "#FFFFFF",
        link: "#0078FF",
        action: "#FF620C",
        inactiveTabIcon: "#0E2F5A",
        error: "#F44235",
        inProgress: "#0078FF",
        complete: "#20B832",
        sourceBg: "#E4EBF1"
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-screen">
      {/* ...existing code... */}
      <main className="col-span-3 flex flex-col items-center gap-4 w-full px-4">
        <h1 className="text-2xl font-semibold">Upload Images</h1>

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
              options={uploadConfig}
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
              options={{
                ...uploadConfig,
                multiple: true
              }}
            />
            <p className="text-sm text-gray-600">Upload Other Images</p>
          </div>
        </div>

        {/* ...rest of your existing code... */}
      </main>
    </div>
  );
}