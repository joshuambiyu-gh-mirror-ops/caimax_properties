"use client";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React, { useState } from "react";
import FormButton from "./form-button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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

        {/* Preview Section */}
        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {thumbnail && (
              <div className="relative aspect-video">
                <CldImage
                  width="400"
                  height="300"
                  src={thumbnail}
                  alt="Thumbnail"
                  className="rounded-lg"
                />
              </div>
            )}
            {images.map((image, index) => (
              <div key={index} className="relative aspect-video">
                <CldImage
                  width="400"
                  height="300"
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Other Listing Attributes */}
      <aside className="bg-white rounded-lg shadow-md p-6 h-fit">
        <form action="" className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900">
            Listing Details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="listingName">Listing Name</Label>
            <Input
              id="listingName"
              name="listingName"
              placeholder="Listing Name"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footage">Footage (sq ft)</Label>
            <Input
              id="footage"
              name="footage"
              type="number"
              placeholder="e.g. 1500"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathroomCount">Bathrooms</Label>
            <Input
              id="bathroomCount"
              name="bathroomCount"
              type="number"
              placeholder="e.g. 2"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedroomCount">Bedrooms</Label>
            <Input
              id="bedroomCount"
              name="bedroomCount"
              type="number"
              placeholder="e.g. 3"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. 123 Main St, City"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g. -1.2921"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g. 36.8219"
              className="w-full"
            />
          </div>
          {/* UserId can be handled on the server side or via context/session */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a detailed description of the listing..."
              className="w-full min-h-[100px]"
            />
          </div>
          <FormButton>
            Submit Listing
          </FormButton>
        </form>
      </aside>
    </div>
  );
}