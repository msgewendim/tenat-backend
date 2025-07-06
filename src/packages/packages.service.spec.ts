import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { getModelToken } from '@nestjs/mongoose';
import { Package } from './schemas/package.schema';
import { Model } from 'mongoose';

const mockPackage = {
  name: 'Test Package',
  image: 'test.jpg',
  price: 10,
  cookingTime: 20,
  ingredientsQuantity: 5,
  peoplesQuantity: 2,
};

describe('PackagesService', () => {
  let service: PackagesService;
  let model: Model<Package>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getModelToken(Package.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    model = module.get<Model<Package>>(getModelToken(Package.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomPackages', () => {
    it('should return an array of packages', async () => {
      const packages = [mockPackage];
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(packages),
      } as any);
      expect(await service.getRandomPackages(1)).toEqual(packages);
    });
  });
});
