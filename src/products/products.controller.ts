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
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ApiResponse } from '@nestjs/swagger'
import { Product } from './schemas/product.schema'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: Product })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all products.', type: [Product] })
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Query('excludeById') excludeById?: string,
  ) {
    const products = await this.productsService.findAll(
      page,
      limit,
      searchTerm,
      category,
      subCategory,
      excludeById,
    );
    return { data: products };
  }

  @Post('names')
  @ApiResponse({ status: 200, description: 'Return products by name.', type: [Product] })
  getProductsByName(@Body('names') names: string[]) {
    return this.productsService.getProductsByName(names);
  }

  @Get('random')
  @ApiResponse({ status: 200, description: 'Return random products.', type: [Product] })
  async getRandomProducts(@Query('page') page: number, @Query('limit') limit: number) {
    const products = await this.productsService.getRandomProducts(page, limit);
    return { data: products };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Return a single product.', type: Product })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.', type: Product })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }
}
