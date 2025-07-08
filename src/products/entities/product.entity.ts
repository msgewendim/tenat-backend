export class FeatureEntity {
  title: string;
  description: string;
}

export class FeatureObjectEntity {
  _id: string;
  value: FeatureEntity[];
}

export class ProductSizeEntity {
  sizeName: string;
  sizeQuantity: number;
}

export class PricingEntity {
  size: ProductSizeEntity;
  price: number;
}

export class SubCategoryEntity {
  nameInHebrew: string;
  nameInEnglish: string;
  nameOfParentCategory: string;
}

export class CategoryEntity {
  nameInHebrew: string;
  nameInEnglish: string;
}

export class ProductEntity {
  _id: string;
  name: string;
  shortDescription: string;
  pricing: PricingEntity[];
  image: string;
  categories: CategoryEntity[];
  subCategories: SubCategoryEntity[];
  features: FeatureObjectEntity;
  totalSales: number;
}
