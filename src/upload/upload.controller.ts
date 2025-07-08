import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
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
  constructor(private readonly uploadService: UploadService) {}

  @Post('images/public')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 uploads per minute for public
  @ApiOperation({
    summary: 'Upload images (Public)',
    description:
      'Public endpoint for uploading images. No authentication required but has stricter rate limits.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Cloudinary folder to upload to',
    example: 'public-uploads',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload successful',
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/SingleUploadResponseDto' },
        { $ref: '#/components/schemas/BatchUploadResponseDto' },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid files or missing files',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  @UseInterceptors(FileInterceptor('file'), FilesInterceptor('files', 5)) // Limit to 5 files for public
  async uploadImagesPublic(
    @UploadedFile() file?: Express.Multer.File,
    @UploadedFiles() files?: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    const uploadFolder = folder || 'public-uploads';

    console.log(`Public upload request to folder: ${uploadFolder}`);

    return this.processUpload(file, files, uploadFolder);
  }

  @Post('images')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute for authenticated users
  // @Permissions('upload:images')
  @ApiOperation({
    summary: 'Upload images (Authenticated)',
    description:
      'Authenticated endpoint for uploading images. Requires valid JWT token and upload permissions.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Cloudinary folder to upload to',
    example: 'products',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload successful',
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/SingleUploadResponseDto' },
        { $ref: '#/components/schemas/BatchUploadResponseDto' },
      ],
    },
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
  @UseInterceptors(FileInterceptor('file'), FilesInterceptor('files', 10))
  async uploadImages(
    @UploadedFile() file?: Express.Multer.File,
    @UploadedFiles() files?: Express.Multer.File[],
    @Query('folder') folder?: string,
    @Req() req?: Request & { user: JwtPayload },
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    const uploadFolder = folder || 'tenat-uploads';
    const userId = req?.user?.sub || 'anonymous';

    console.log(`User ${userId} is uploading to folder: ${uploadFolder}`);

    return this.processUpload(file, files, uploadFolder);
  }

  private async processUpload(
    file?: Express.Multer.File,
    files?: Express.Multer.File[],
    uploadFolder?: string,
  ): Promise<SingleUploadResponseDto | BatchUploadResponseDto> {
    // Check if we have any files
    if (!file && (!files || files.length === 0)) {
      throw new BadRequestException(
        'No files provided. Please upload at least one image file.',
      );
    }

    // Single file upload
    if (file && (!files || files.length === 0)) {
      try {
        return await this.uploadService.uploadSingleImage(file, uploadFolder);
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Multiple files upload (batch)
    if (files && files.length > 0) {
      // If both file and files are provided, combine them
      const allFiles = file ? [file, ...files] : files;

      try {
        return await this.uploadService.uploadMultipleImages(
          allFiles,
          uploadFolder,
        );
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    throw new BadRequestException('No valid files provided');
  }
}
