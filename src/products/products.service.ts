import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(
    page?: number,
    limit?: number,
    searchTerm?: string,
    category?: string,
    subCategory?: string,
    excludeById?: string,
  ): Promise<Product[]> {
    const query: QueryOptions = {};
    page = page && page > 0 ? page : 1;
    limit = limit ?? 9;

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { shortDescription: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (category || subCategory) {
      const filters: any[] = [];

      if (category) {
        filters.push({
          categories: {
            $elemMatch: {
              nameInEnglish: { $regex: category },
            },
          },
        });
        if (excludeById) {
          filters.push({
            _id: { $ne: excludeById },
          });
        }
      }

      if (subCategory) {
        filters.push({
          subCategories: {
            $elemMatch: {
              nameInEnglish: { $regex: subCategory },
            },
          },
        });
      }

      if (filters.length > 1) {
        query.$and = filters;
      } else {
        Object.assign(query, filters[0]);
      }
    }
    return this.productModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }
    return deletedProduct;
  }

  async getRandomProducts(page: number, limit: number): Promise<any> {
    const totalProducts = await this.productModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await this.productModel
      .aggregate([{ $sample: { size: limit } }, { $skip: (page - 1) * limit }])
      .exec();
    return { items: products, currentPage: page, totalPages };
  }

  async getProductsByName(names: string[]): Promise<Product[]> {
    const nameRegexPatterns = names.map((name) => new RegExp(name, 'i'));
    return this.productModel
      .aggregate([
        {
          $match: {
            name: { $in: nameRegexPatterns },
          },
        },
        {
          $group: {
            _id: '$_id',
            doc: { $first: '$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
        },
        {
          $sort: { name: 1 },
        },
      ])
      .exec();
  }
}
