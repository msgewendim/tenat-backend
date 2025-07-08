import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './schemas/recipe.schema';

@Injectable()
export class RecipesService {
  constructor(@InjectModel(Recipe.name) private recipeModel: Model<Recipe>) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const createdRecipe = new this.recipeModel(createRecipeDto);
    return createdRecipe.save();
  }

  async findAll(
    page: number,
    limit: number,
    searchTerm?: string,
    category?: string,
    excludeById?: string,
  ): Promise<Recipe[]> {
    const query: QueryOptions = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (category) {
      query.categories = {
        $elemMatch: {
          nameInEnglish: { $regex: category },
        },
      };
      if (excludeById) {
        query._id = { $ne: excludeById };
      }
    }

    return this.recipeModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Recipe | null> {
    return this.recipeModel.findById(id).exec();
  }

  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe | null> {
    return this.recipeModel
      .findByIdAndUpdate(id, updateRecipeDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Recipe | null> {
    return this.recipeModel.findByIdAndDelete(id).exec();
  }

  async getRandomRecipes(page: number, limit: number): Promise<any> {
    const totalRecipes = await this.recipeModel.countDocuments();
    const totalPages = Math.ceil(totalRecipes / limit);
    const recipes = await this.recipeModel
      .aggregate([{ $sample: { size: limit } }, { $skip: (page - 1) * limit }])
      .exec();
    return { items: recipes, currentPage: page, totalPages };
  }

  async getRecipesByName(name: string): Promise<Recipe[]> {
    return this.recipeModel
      .find({ name: { $regex: name, $options: 'i' } })
      .exec();
  }
}
