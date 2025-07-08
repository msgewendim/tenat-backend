import { Document } from 'mongoose';

export class AddressEntity {
  street: string;
  streetNum: string;
  city: string;
  postal_code?: string;
  country?: string;
}

export class CustomerEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: AddressEntity;
}

export class CartItemEntity {
  item: string;
  itemType: 'Product' | 'Package';
  quantity: number;
  price: number;
  size: string;
  name: string;
  image?: string;
}

export class PaymentDetailsEntity {
  transaction_uid?: string;
  transaction_status?: string;
  transaction_amount?: number;
  transaction_currency?: string;
  transaction_date?: Date;
  transaction_type?: string;
  number_of_payments?: number;
  first_payment_amount?: number;
  rest_payments_amount?: number;
  card_holder_name?: string;
  customer_uid?: string;
  terminal_uid?: string;
}

export class OrderEntity extends Document {
  customer: CustomerEntity;
  items: CartItemEntity[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentDetails: PaymentDetailsEntity | null;
}
