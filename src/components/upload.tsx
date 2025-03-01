"use client";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React, { useState, useTransition } from "react";
import FormButton from "./form-button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { createListing } from "@/actions/create-listing";

export default function UpLoad() {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>([]); // Single array for all images
  const [formData, setFormData] = useState({
    listingName: '',
    footage: '',
    bathroomCount: '',
    bedroomCount: '',
    location: '',
    latitude: '',
    longitude: '',
    description: ''
  });

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

  const handleThumbnailUpload = (result: any) => {
    if (result.info?.public_id) {
      setImages(prev => {
        const newImages = [...prev];
        // Replace thumbnail (index 0) or add to beginning
        if (newImages.length === 0) {
          return [result.info.public_id];
        } else {
          newImages[0] = result.info.public_id;
          return newImages;
        }
      });
    }
  };

  const handleImagesUpload = (result: any) => {
    if (result.info?.public_id) {
      setImages(prev => {
        // Preserve thumbnail at index 0, add new images after
        if (prev.length === 0) {
          return [result.info.public_id];
        }
        return [...prev, result.info.public_id];
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    startTransition(async () => {
      const result = await createListing({
        ...formData,
        footage: Number(formData.footage),
        bathroomCount: Number(formData.bathroomCount),
        bedroomCount: Number(formData.bedroomCount),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        images
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      // Reset form
      setImages([]);
      setFormData({
        listingName: '',
        footage: '',
        bathroomCount: '',
        bedroomCount: '',
        location: '',
        latitude: '',
        longitude: '',
        description: ''
      });
    });
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
              onSuccess={handleThumbnailUpload}
              options={{
                ...uploadConfig,
                multiple: false,
                maxFiles: 1
              }}
            />
            <p className="text-sm text-gray-600">Upload Thumbnail (First Image)</p>
          </div>

          {/* Additional Images Upload */}
          <div className="flex flex-col items-center">
            <CldUploadButton
              uploadPreset="xpbhz3av"
              onSuccess={handleImagesUpload}
              options={{
                ...uploadConfig,
                multiple: true
              }}
            />
            <p className="text-sm text-gray-600">Upload Additional Images</p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`relative aspect-video ${index === 0 ? 'border-2 border-blue-500' : ''}`}
              >
                <CldImage
                  width="400"
                  height="300"
                  src={image}
                  alt={index === 0 ? "Thumbnail" : `Image ${index}`}
                  className="rounded-lg"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
                    Thumbnail
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Other Listing Attributes */}
      <aside className="bg-white rounded-lg shadow-md p-6 h-fit">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900">
            Listing Details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="listingName">Listing Name</Label>
            <Input
              id="listingName"
              name="listingName"
              value={formData.listingName}
              onChange={handleInputChange}
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
              value={formData.footage}
              onChange={handleInputChange}
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
              value={formData.bathroomCount}
              onChange={handleInputChange}
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
              value={formData.bedroomCount}
              onChange={handleInputChange}
              placeholder="e.g. 3"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
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
              value={formData.latitude}
              onChange={handleInputChange}
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
              value={formData.longitude}
              onChange={handleInputChange}
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
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a detailed description of the listing..."
              className="w-full min-h-[100px]"
            />
          </div>
          <FormButton type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Listing'}
          </FormButton>
        </form>
      </aside>
    </div>
  );
}