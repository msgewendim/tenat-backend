import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

const mockRecipe = {
  name: 'Test Recipe',
  description: 'Test Description',
  image: 'test.jpg',
  categories: [],
  ingredients: [],
  difficulty: 'Easy',
  instructions: [],
  prepTime: '10 mins',
  servings: 2,
};

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: {
            getRandomRecipes: jest.fn().mockResolvedValue([mockRecipe]),
            getRecipesByName: jest.fn().mockResolvedValue([mockRecipe]),
          },
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRandomRecipes', () => {
    it('should call getRandomRecipes on the service', async () => {
      await controller.getRandomRecipes('1');
      expect(service.getRandomRecipes).toHaveBeenCalledWith(1);
    });
  });

  describe('getRecipesByName', () => {
    it('should call getRecipesByName on the service', async () => {
      await controller.getRecipesByName('Test Recipe');
      expect(service.getRecipesByName).toHaveBeenCalledWith('Test Recipe');
    });
  });
});
