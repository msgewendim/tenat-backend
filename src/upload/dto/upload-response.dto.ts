import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({
    description: 'Original filename of the uploaded file',
    example: 'image.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Secure URL of the uploaded file on Cloudinary',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimeType: string;
}

export class UploadErrorDto {
  @ApiProperty({
    description: 'Original filename that failed to upload',
    example: 'invalid.txt',
  })
  originalName: string;

  @ApiProperty({
    description: 'Error message describing why upload failed',
    example:
      'Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed',
  })
  error: string;
}

export class BatchUploadResponseDto {
  @ApiProperty({
    type: [UploadedFileDto],
    description: 'Successfully uploaded files',
    example: [
      {
        originalName: 'image1.jpg',
        url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/image1.jpg',
        size: 1024000,
        mimeType: 'image/jpeg',
      },
    ],
  })
  successful: UploadedFileDto[];

  @ApiProperty({
    type: [UploadErrorDto],
    description: 'Files that failed to upload',
    example: [
      {
        originalName: 'invalid.txt',
        error: 'Invalid file type',
      },
    ],
  })
  failed: UploadErrorDto[];

  @ApiProperty({
    description: 'Total number of files processed',
    example: 2,
  })
  total: number;

  @ApiProperty({
    description: 'Number of successfully uploaded files',
    example: 1,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failed uploads',
    example: 1,
  })
  failureCount: number;
}

export class SingleUploadResponseDto {
  @ApiProperty({
    description: 'Original filename of the uploaded file',
    example: 'image.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Secure URL of the uploaded file on Cloudinary',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimeType: string;
}
