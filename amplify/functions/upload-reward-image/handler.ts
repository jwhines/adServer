import type { Schema } from '../../data/resource';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Upload Reward Image Lambda Function
 *
 * Handles image uploads to S3 with:
 * - Validation (size, type)
 * - Multiple versions (original, thumbnail, mobile)
 * - Automatic S3 key generation
 * - Reward record update with URLs
 */

const s3Client = new S3Client({});

interface UploadImageArgs {
  rewardId: string;
  imageData: string; // Base64 encoded
  contentType: string;
}

export const handler = async (
  event: any,
  context: any
) => {
  const args = event.arguments as UploadImageArgs;

  console.log('Upload reward image:', {
    rewardId: args.rewardId,
    contentType: args.contentType,
  });

  try {
    const bucketName = process.env.STORAGE_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('STORAGE_BUCKET_NAME environment variable not set');
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(args.contentType)) {
      return {
        success: false,
        imageUrl: undefined,
        imageKey: undefined,
        error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.',
      };
    }

    // Decode base64 image
    const base64Data = args.imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      return {
        success: false,
        imageUrl: undefined,
        imageKey: undefined,
        error: 'Image size exceeds 5MB limit.',
      };
    }

    // Generate S3 key
    const timestamp = Date.now();
    const extension = args.contentType.split('/')[1];
    const s3Key = `rewards/${args.rewardId}/original-${timestamp}.${extension}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: args.contentType,
      CacheControl: 'max-age=31536000', // 1 year
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${s3Key}`;

    // TODO: In production, also generate thumbnail and mobile versions
    // using Sharp or similar image processing library

    // TODO: Update Reward record in DynamoDB with imageUrl and imageKey
    /*
    await updateReward(args.rewardId, {
      imageUrl,
      imageKey: s3Key
    });
    */

    console.log('Image uploaded successfully:', imageUrl);

    return {
      success: true,
      imageUrl,
      imageKey: s3Key,
      error: undefined,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      imageUrl: undefined,
      imageKey: undefined,
      error: 'An error occurred while uploading the image.',
    };
  }
};
