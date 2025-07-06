import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { getModelToken } from '@nestjs/mongoose';
import { Recipe } from './schemas/recipe.schema';
import { Model } from 'mongoose';

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

describe('RecipesService', () => {
  let service: RecipesService;
  let model: Model<Recipe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getModelToken(Recipe.name),
          useValue: {
            aggregate: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    model = module.get<Model<Recipe>>(getModelToken(Recipe.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRandomRecipes', () => {
    it('should return an array of recipes', async () => {
      const recipes = [mockRecipe];
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipes),
      } as any);
      expect(await service.getRandomRecipes(1)).toEqual(recipes);
    });
  });

  describe('getRecipesByName', () => {
    it('should return an array of recipes', async () => {
      const recipes = [mockRecipe];
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipes),
      } as any);
      expect(await service.getRecipesByName('Test Recipe')).toEqual(recipes);
    });
  });
});
