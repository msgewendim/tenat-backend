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
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Package } from './schemas/package.schema';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiResponse({
    status: 201,
    description: 'The package has been successfully created.',
    type: Package,
  })
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Return all packages.',
    type: [Package],
  })
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return await this.packagesService.findAll(page, limit);
  }

  @Get('random')
  @ApiResponse({
    status: 200,
    description: 'Return random packages.',
    type: [Package],
  })
  async getRandomPackages(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.packagesService.getRandomPackages(page, limit);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Return a single package.',
    type: Package,
  })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiResponse({
    status: 200,
    description: 'The package has been successfully updated.',
    type: Package,
  })
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The package has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
