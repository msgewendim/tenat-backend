import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const mockProduct = {
  name: 'Test Product',
  shortDescription: 'Test Description',
  pricing: [],
  image: 'test.jpg',
  categories: [],
  subCategories: [],
  features: { value: [] },
  totalSales: 0,
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getRandomProducts: jest.fn().mockResolvedValue([mockProduct]),
            getProductsByName: jest.fn().mockResolvedValue([mockProduct]),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRandomProducts', () => {
    it('should call getRandomProducts on the service', async () => {
      await controller.getRandomProducts('1');
      expect(service.getRandomProducts).toHaveBeenCalledWith(1);
    });
  });

  describe('getProductsByName', () => {
    it('should call getProductsByName on the service', async () => {
      await controller.getProductsByName(['Test Product']);
      expect(service.getProductsByName).toHaveBeenCalledWith(['Test Product']);
    });
  });
});
