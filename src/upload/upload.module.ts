import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuthModule } from '../auth/auth.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        storage: memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
          files: 10, // Max 10 files in batch
        },
        fileFilter: (req, file, cb) => {
          // Only allow image files
          const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
