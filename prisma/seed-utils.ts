import { S3 } from 'aws-sdk';
import fetch from 'node-fetch';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadImageToS3FromUrl(imageUrl: string): Promise<string> {
  try {
    // Fetch the image from Unsplash
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    const buffer = await response.buffer();

    // Generate a unique filename
    const fileName = `seed-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'caimax-bucket',
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg',
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    // Return the original URL as fallback
    return imageUrl;
  }
}