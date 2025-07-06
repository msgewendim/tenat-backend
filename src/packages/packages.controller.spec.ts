import { Test, TestingModule } from '@nestjs/testing';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

const mockPackage = {
  name: 'Test Package',
  image: 'test.jpg',
  price: 10,
  cookingTime: 20,
  ingredientsQuantity: 5,
  peoplesQuantity: 2,
};

describe('PackagesController', () => {
  let controller: PackagesController;
  let service: PackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
      providers: [
        {
          provide: PackagesService,
          useValue: {
            getRandomPackages: jest.fn().mockResolvedValue([mockPackage]),
          },
        },
      ],
    }).compile();

    controller = module.get<PackagesController>(PackagesController);
    service = module.get<PackagesService>(PackagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRandomPackages', () => {
    it('should call getRandomPackages on the service', async () => {
      await controller.getRandomPackages('1');
      expect(service.getRandomPackages).toHaveBeenCalledWith(1);
    });
  });
});
