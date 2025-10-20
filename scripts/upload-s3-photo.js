// This script uploads a photo to your AWS S3 bucket using credentials from the .env file.
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const filePath = path.join(__dirname, '../public/ls1.jpg');
const fileContent = fs.readFileSync(filePath);

const params = {
  Bucket: process.env.AWS_S3_BUCKET_NAME || 'caimax-bucket',
  Key: 'ls1.jpg', // S3 object key
  Body: fileContent,
  ContentType: 'image/jpeg',
};

s3.upload(params, function(err, data) {
  if (err) {
    console.error('Error uploading file:', err);
    process.exit(1);
  }
  console.log('File uploaded successfully at:', data.Location);
  process.exit(0);
});
