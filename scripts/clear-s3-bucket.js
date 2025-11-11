#!/usr/bin/env node

/**
 * Script to clear all objects from the S3 bucket.
 * This removes all uploaded images without affecting the bucket itself.
 * 
 * Usage: node scripts/clear-s3-bucket.js
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function clearS3Bucket() {
  try {
    console.log(`\n🗑️  Starting to clear S3 bucket: ${bucketName}`);
    console.log(`Region: ${process.env.AWS_REGION}`);

    // List all objects in the bucket
    console.log('\n📋 Listing all objects...');
    let listParams = {
      Bucket: bucketName,
      MaxKeys: 1000
    };

    let allObjects = [];
    let isTruncated = true;
    let continuationToken = null;

    while (isTruncated) {
      if (continuationToken) {
        listParams.ContinuationToken = continuationToken;
      }

      const listResponse = await s3.listObjectsV2(listParams).promise();
      
      if (listResponse.Contents) {
        allObjects = allObjects.concat(listResponse.Contents);
        console.log(`  Found ${listResponse.Contents.length} objects in this batch`);
      }

      isTruncated = listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }

    if (allObjects.length === 0) {
      console.log('✅ Bucket is already empty!');
      return;
    }

    console.log(`\n📦 Total objects to delete: ${allObjects.length}`);

    // Delete all objects in batches
    const batchSize = 1000;
    for (let i = 0; i < allObjects.length; i += batchSize) {
      const batch = allObjects.slice(i, i + batchSize);
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: batch.map(obj => ({ Key: obj.Key }))
        }
      };

      console.log(`\n🗑️  Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allObjects.length / batchSize)} (${batch.length} objects)...`);
      
      try {
        const deleteResponse = await s3.deleteObjects(deleteParams).promise();
        
        if (deleteResponse.Deleted) {
          console.log(`  ✓ Successfully deleted ${deleteResponse.Deleted.length} objects`);
        }

        if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
          console.error(`  ❌ Failed to delete ${deleteResponse.Errors.length} objects:`);
          deleteResponse.Errors.forEach(err => {
            console.error(`    - ${err.Key}: ${err.Message}`);
          });
        }
      } catch (batchError) {
        console.error(`  ❌ Error deleting batch: ${batchError.message}`);
        throw batchError;
      }
    }

    console.log(`\n✅ Successfully cleared all ${allObjects.length} objects from S3 bucket!`);
    console.log(`🎉 S3 bucket is now empty and ready for new uploads.\n`);

  } catch (error) {
    console.error('\n❌ Error clearing S3 bucket:');
    console.error(error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.error('\n⚠️  The bucket does not exist or is not accessible.');
    } else if (error.code === 'AccessDenied') {
      console.error('\n⚠️  Access denied. Check your AWS credentials and permissions.');
    }
    
    process.exit(1);
  }
}

// Run the script
clearS3Bucket();
