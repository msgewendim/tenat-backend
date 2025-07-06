export class UserEntity {
  _id: string;
  email: string;
  mobile: boolean;
  name: string;
  address: {
    street: string;
    city: string;
    zip: string;
  };
  role: string;
  orders: any[]; // Replace with actual Order type
  created_at: Date;
  updated_at: Date;
}