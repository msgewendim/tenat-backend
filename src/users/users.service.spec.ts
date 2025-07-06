import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CartItemDto } from './dto/cart-item.dto';

const mockUser = {
  _id: 'userId',
  name: 'Test User',
  email: 'test@example.com',
  mobile: '1234567890',
  address: {
    street: 'Test Street',
    city: 'Test City',
    zip: '12345',
  },
  role: 'user',
  orders: [],
  cart: [],
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add an item to the cart and return the updated user', async () => {
      const cartItemDto: CartItemDto = {
        productId: 'productId',
        quantity: 1,
        size: 'M',
      };
      const updatedUser = { ...mockUser, cart: [cartItemDto] };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as any);

      const result = await service.addToCart(mockUser._id, cartItemDto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { $push: { cart: cartItemDto } },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('clearCart', () => {
    it('should clear the cart and return the updated user', async () => {
      const updatedUser = { ...mockUser, cart: [] };

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      } as any);

      const result = await service.clearCart(mockUser._id);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { $set: { cart: [] } },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });
  });
});
