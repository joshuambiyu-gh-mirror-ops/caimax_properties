// This script tests the connection to your AWS S3 bucket using credentials from the .env file.
require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function testS3Connection() {
  try {
    // List buckets as a simple test
    const result = await s3.listBuckets().promise();
    console.log('S3 Buckets:', result.Buckets);
    console.log('S3 connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('S3 connection failed:', error);
    process.exit(1);
  }
}

testS3Connection();
