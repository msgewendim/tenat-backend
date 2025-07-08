import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({ description: 'Original filename of the uploaded file' })
  originalName: string;

  @ApiProperty({ description: 'Secure URL of the uploaded file on Cloudinary' })
  url: string;

  @ApiProperty({ description: 'File size in bytes' })
  size: number;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;
}

export class UploadErrorDto {
  @ApiProperty({ description: 'Original filename that failed to upload' })
  originalName: string;

  @ApiProperty({ description: 'Error message describing why upload failed' })
  error: string;
}

export class BatchUploadResponseDto {
  @ApiProperty({
    type: [UploadedFileDto],
    description: 'Successfully uploaded files',
  })
  successful: UploadedFileDto[];

  @ApiProperty({
    type: [UploadErrorDto],
    description: 'Files that failed to upload',
  })
  failed: UploadErrorDto[];

  @ApiProperty({ description: 'Total number of files processed' })
  total: number;

  @ApiProperty({ description: 'Number of successfully uploaded files' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed uploads' })
  failureCount: number;
}

export class SingleUploadResponseDto extends UploadedFileDto {
}