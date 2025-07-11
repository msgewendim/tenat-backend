import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import {
  UploadedFileDto,
  UploadErrorDto,
  BatchUploadResponseDto,
  SingleUploadResponseDto,
} from './dto/upload-response.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a single image to Cloudinary
   */
  async uploadSingleImage(
    file: Express.Multer.File,
    folder: string = 'tenat-uploads',
  ): Promise<SingleUploadResponseDto> {
    try {
      // Validate the image file
      const validation = this.validateImageFile(file.buffer, file.originalname);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      const result = await this.uploadImageToCloudinary(
        file.buffer,
        file.originalname,
        folder,
      );

      return {
        originalName: file.originalname,
        url: result.secure_url,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image ${file.originalname}:`, error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'tenat-uploads',
  ): Promise<BatchUploadResponseDto> {
    const successful: UploadedFileDto[] = [];
    const failed: UploadErrorDto[] = [];

    // Process uploads in parallel with a concurrency limit
    const promises = files.map((file) =>
      this.uploadSingleImageSafe(file, folder),
    );
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const file = files[index];
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push({
          originalName: file.originalname,
          error: result.reason?.message ?? 'Upload failed',
        });
      }
    });

    return {
      successful,
      failed,
      total: files.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  }

  /**
   * Upload image to Cloudinary with optimization
   */
  private async uploadImageToCloudinary(
    buffer: Buffer,
    originalFileName: string,
    folder: string,
  ) {
    const base64 = buffer.toString('base64');
    const mimeType = this.getImageMimeType(originalFileName);
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Generate unique filename to prevent conflicts
    const fileExt = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = `${Date.now()}_${randomUUID()}`;
    const publicId = `${uniqueId}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      public_id: publicId,
      resource_type: 'image',
      format: fileExt,
      // Image optimization settings
      quality: 'auto:good',
      fetch_format: 'auto',
      crop: 'limit',
      width: 2000, // Max width to control file size
      height: 2000, // Max height to control file size
      overwrite: false,
      unique_filename: true,
    });

    return result;
  }

  /**
   * Safe wrapper for single image upload that catches errors
   */
  private async uploadSingleImageSafe(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadedFileDto> {
    try {
      return await this.uploadSingleImage(file, folder);
    } catch (error) {
      // Re-throw with proper error handling for Promise.allSettled
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  /**
   * Validate image file
   */
  private validateImageFile(
    buffer: Buffer,
    fileName: string,
    maxSizeMB: number = 5,
  ): { isValid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
      };
    }

    // Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error:
          'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed',
      };
    }

    // Basic image file validation (check for magic bytes)
    const isValidImage = this.validateImageBuffer(buffer);
    if (!isValidImage) {
      return { isValid: false, error: 'Invalid image file format' };
    }

    return { isValid: true };
  }

  /**
   * Get MIME type based on file extension
   */
  private getImageMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return mimeTypes[ext || 'jpg'] || 'image/jpeg';
  }

  /**
   * Validate image buffer by checking magic bytes
   */
  private validateImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;

    // Check for common image file signatures
    const signatures = [
      [0xff, 0xd8, 0xff], // JPEG
      [0x89, 0x50, 0x4e, 0x47], // PNG
      [0x47, 0x49, 0x46], // GIF
      [0x52, 0x49, 0x46, 0x46], // WebP (RIFF)
    ];

    return signatures.some((sig) =>
      sig.every((byte, index) => buffer[index] === byte),
    );
  }

  /**
   * Delete an asset from Cloudinary given its secure URL
   */
  async deleteAsset(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const pathSegments = url.pathname.split('/');
      const resourceType = pathSegments[1] ?? 'image';

      const parts = fileUrl.split('/upload/');
      if (parts.length !== 2) throw new Error('Invalid Cloudinary URL');

      const publicIdWithVersion = parts[1];
      const publicId = publicIdWithVersion
        .replace(/v\d+\//, '')
        .replace(/\.[^/.]+$/, '');

      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });
      } catch (err) {
        // Fallback: try other common resource types if not found
        const fallbackTypes = ['image', 'video', 'raw'].filter(
          (t) => t !== resourceType,
        );
        for (const t of fallbackTypes) {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: t });
            return;
          } catch {
            // continue
          }
        }
        throw err;
      }
    } catch (err) {
      this.logger.error('[deleteAsset] Failed to delete asset', err);
      throw err;
    }
  }
}
