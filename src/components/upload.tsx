"use client";
import React, { useState, useTransition, useRef } from "react";
import FormButton from "./form-button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { createListing } from "@/actions/create-listing";

export default function UpLoad() {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<File[]>([]); // Store File objects
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // For preview URLs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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


  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Remove image by index
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      // Upload each image to the S3 upload API
      const uploadedImageKeys: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          alert('Failed to upload image: ' + file.name);
          return;
        }
        const data = await res.json();
        // You can use data.key (S3 object key) or data.url (full URL)
        uploadedImageKeys.push(data.key);
      }

      // Now create the listing with the S3 image keys
      const result = await createListing({
        ...formData,
        footage: Number(formData.footage),
        bathroomCount: Number(formData.bathroomCount),
        bedroomCount: Number(formData.bedroomCount),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        images: uploadedImageKeys,
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      // Reset form
      setImages([]);
      setImagePreviews([]);
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

        <div className="flex flex-col items-center gap-4 mt-4 w-full">
          <label className="block w-full">
            <span className="sr-only">Choose images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <p className="text-sm text-gray-600">Select one or more images to upload</p>
        </div>

        {/* Preview Section */}
        <div className="mt-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {imagePreviews.map((url, index) => (
              <div
                key={index}
                className={`relative aspect-video ${index === 0 ? 'border-2 border-blue-500' : ''}`}
              >
                <img
                  src={url}
                  alt={index === 0 ? "Thumbnail" : `Image ${index}`}
                  className="rounded-lg object-cover w-full h-full"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
                    Thumbnail
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs hover:bg-red-700"
                  aria-label="Remove image"
                >
                  &times;
                </button>
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