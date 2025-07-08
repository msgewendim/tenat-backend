export class IngredientEntity {
  name: string;
  quantity: string;
  existsInProducts: boolean;
}

export class InstructionEntity {
  step: number;
  description: string;
  _id?: string;
}

export class CategoryEntity {
  nameInHebrew: string;
  nameInEnglish: string;
}

export class RecipeEntity {
  _id: string;
  name: string;
  description: string;
  image: string;
  categories: CategoryEntity[];
  ingredients: IngredientEntity[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: InstructionEntity[];
  prepTime: string;
  servings: number;
  createdAt: Date;
}
