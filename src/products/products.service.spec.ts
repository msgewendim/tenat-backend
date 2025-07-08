import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';

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

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            aggregate: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<Product>>(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomProducts', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(products),
      } as any);
      expect(await service.getRandomProducts(1)).toEqual(products);
    });
  });

  describe('getProductsByName', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(products),
      } as any);
      expect(await service.getProductsByName(['Test Product'])).toEqual(
        products,
      );
    });
  });
});
