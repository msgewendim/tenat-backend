import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './schemas/package.schema';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const createdPackage = new this.packageModel(createPackageDto);
    return createdPackage.save();
  }

  async findAll(page?: number, limit?: number): Promise<Package[]> {
    page = page && page > 0 ? page : 1;
    limit = limit ?? 9;
    return this.packageModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Package | null> {
    return this.packageModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package | null> {
    return this.packageModel
      .findByIdAndUpdate(id, updatePackageDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Package | null> {
    return this.packageModel.findByIdAndDelete(id).exec();
  }

  async getRandomPackages(page: number, limit: number): Promise<any> {
    const totalPackages = await this.packageModel.countDocuments();
    const totalPages = Math.ceil(totalPackages / limit);
    const packages = await this.packageModel
      .aggregate([{ $sample: { size: limit } }, { $skip: (page - 1) * limit }])
      .exec();
    return { items: packages, currentPage: page, totalPages };
  }
}
