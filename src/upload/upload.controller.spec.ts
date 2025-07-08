import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    uploadSingleImage: jest.fn(),
    uploadMultipleImages: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw BadRequestException when no files provided', async () => {
    await expect(controller.uploadImages()).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should upload single file', async () => {
    const mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const expectedResult = {
      originalName: 'test.jpg',
      url: 'https://cloudinary.com/test.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
    };

    mockUploadService.uploadSingleImage.mockResolvedValue(expectedResult);

    const result = await controller.uploadImages(mockFile);
    expect(result).toEqual(expectedResult);
    expect(mockUploadService.uploadSingleImage).toHaveBeenCalledWith(
      mockFile,
      'tenat-uploads',
    );
  });
});
