import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Recipe } from './schemas/recipe.schema';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 201,
    description: 'The recipe has been successfully created.',
    type: Recipe,
  })
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Return all recipes.',
    type: [Recipe],
  })
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('category') category?: string,
    @Query('excludeById') excludeById?: string,
  ) {
    const recipes = await this.recipesService.findAll(
      page,
      limit,
      searchTerm,
      category,
      excludeById,
    );
    return recipes;
  }

  @Get('names')
  @ApiResponse({
    status: 200,
    description: 'Return recipes by name.',
    type: [Recipe],
  })
  getRecipesByName(@Query('name') name: string) {
    return this.recipesService.getRecipesByName(name);
  }

  @Get('random')
  @ApiResponse({
    status: 200,
    description: 'Return random recipes.',
    type: [Recipe],
  })
  async getRandomRecipes(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    const recipes = await this.recipesService.getRandomRecipes(page, limit);
    return recipes;
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Return a single recipe.',
    type: Recipe,
  })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 200,
    description: 'The recipe has been successfully updated.',
    type: Recipe,
  })
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The recipe has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
  }
}
