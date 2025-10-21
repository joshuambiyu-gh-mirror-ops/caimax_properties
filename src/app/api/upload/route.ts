export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb', // Increase as needed
    },
  },
};
import { NextRequest, NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME || 'caimax-bucket',
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
    // ACL removed
  };

  try {
    const data = await s3.upload(params).promise();
    return NextResponse.json({ url: data.Location, key: data.Key });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 });
  }
}
