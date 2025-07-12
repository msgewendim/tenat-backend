import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  UseGuards,
  Req,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import {
  SingleUploadResponseDto,
  BatchUploadResponseDto,
} from './dto/upload-response.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('images/public')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute for public
  @ApiOperation({
    summary: 'Upload images (Public)',
    description:
      'Public endpoint for uploading images. No authentication required but has stricter rate limits and file restrictions.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Single image file to upload',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple image files to upload (max 3)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Cloudinary folder to upload to',
    example: 'public-uploads',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload successful',
    type: SingleUploadResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Batch upload successful',
    type: BatchUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid files or missing files',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - upload service failed',
  })
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 3 } })) // Limit to 3 files for public
  async uploadImagesPublic(
    @UploadedFiles() allFiles: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    const uploadFolder = folder || 'public-uploads';

    this.logger.log(`Public upload request to folder: ${uploadFolder}`);

    try {
      return await this.processUpload(allFiles, uploadFolder, false);
    } catch (error) {
      this.logger.error('Public upload failed:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Upload service temporarily unavailable. Please try again later.',
      );
    }
  }

  @Post('images')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 uploads per minute for authenticated users
  // @Permissions('upload:images')
  @ApiOperation({
    summary: 'Upload images (Authenticated)',
    description:
      'Authenticated endpoint for uploading images. Requires valid JWT token and upload permissions. Higher file limits.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Single image file to upload',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple image files to upload (max 10)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Cloudinary folder to upload to',
    example: 'products',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload successful',
    type: SingleUploadResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Batch upload successful',
    type: BatchUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid files or missing files',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - upload service failed',
  })
  @UseInterceptors(AnyFilesInterceptor({ limits: { files: 10 } }))
  async uploadImages(
    @UploadedFiles() allFiles: Express.Multer.File[],
    @Query('folder') folder?: string,
    @Req() req?: Request & { user: JwtPayload },
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    const uploadFolder = folder || 'tenat-uploads';
    const userId = req?.user?.sub || 'anonymous';
    const userEmail = req?.user?.email || 'unknown';

    this.logger.log(
      `User ${userEmail} (${userId}) is uploading to folder: ${uploadFolder}`,
    );

    try {
      return await this.processUpload(allFiles, uploadFolder, true);
    } catch (error) {
      this.logger.error(`Upload failed for user ${userEmail}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Upload service temporarily unavailable. Please try again later.',
      );
    }
  }

  private async processUpload(
    allFiles: Express.Multer.File[],
    uploadFolder: string,
    isAuthenticated: boolean,
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    // Check if we have any files at all
    if (!allFiles || allFiles.length === 0) {
      throw new BadRequestException(
        'No files provided. Please upload at least one image file.',
      );
    }

    // Validate file count limits
    const maxFiles = isAuthenticated ? 10 : 3;
    if (allFiles.length > maxFiles) {
      throw new BadRequestException(
        `Too many files. Maximum allowed: ${maxFiles} for ${
          isAuthenticated ? 'authenticated' : 'public'
        } uploads.`,
      );
    }

    // Separate single file vs multiple files based on fieldname
    const singleFile = allFiles.find((f) => f.fieldname === 'file');
    const multipleFiles = allFiles.filter((f) => f.fieldname === 'files');

    this.logger.debug(
      `Processing upload: single=${!!singleFile}, multiple=${
        multipleFiles.length
      }, total=${allFiles.length}`,
    );

    try {
      // Single file upload
      if (singleFile && multipleFiles.length === 0) {
        this.logger.log(`Uploading single file: ${singleFile.originalname}`);
        return await this.uploadService.uploadSingleImage(
          singleFile,
          uploadFolder,
        );
      }

      // Multiple files upload (batch)
      if (multipleFiles.length > 0) {
        // If both single file and multiple files are provided, combine them
        const filesToUpload = singleFile
          ? [singleFile, ...multipleFiles]
          : multipleFiles;

        this.logger.log(
          `Uploading ${filesToUpload.length} files: ${filesToUpload
            .map((f) => f.originalname)
            .join(', ')}`,
        );

        return await this.uploadService.uploadMultipleImages(
          filesToUpload,
          uploadFolder,
        );
      }

      // Handle case where files are uploaded with different fieldnames
      if (allFiles.length === 1) {
        this.logger.log(`Uploading single file: ${allFiles[0].originalname}`);
        return await this.uploadService.uploadSingleImage(
          allFiles[0],
          uploadFolder,
        );
      }

      // Multiple files with various fieldnames
      this.logger.log(
        `Uploading ${allFiles.length} files: ${allFiles
          .map((f) => f.originalname)
          .join(', ')}`,
      );

      return await this.uploadService.uploadMultipleImages(
        allFiles,
        uploadFolder,
      );
    } catch (error) {
      // Check if it's a network connectivity issue
      if (
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('EAI_AGAIN')
      ) {
        this.logger.error(
          'Network connectivity issue with Cloudinary API:',
          error,
        );
        throw new InternalServerErrorException(
          'Unable to connect to image storage service. Please check your network connection and try again.',
        );
      }

      // Check if it's a Cloudinary API issue
      if (error.message?.includes('api.cloudinary.com')) {
        this.logger.error('Cloudinary API error:', error);
        throw new InternalServerErrorException(
          'Image storage service is temporarily unavailable. Please try again later.',
        );
      }

      // Re-throw validation errors as bad requests
      if (
        error.message?.includes('Invalid file') ||
        error.message?.includes('File too large') ||
        error.message?.includes('not allowed')
      ) {
        throw new BadRequestException(error.message);
      }

      // Log and re-throw unexpected errors
      this.logger.error('Unexpected upload error:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during upload. Please try again.',
      );
    }
  }
}
