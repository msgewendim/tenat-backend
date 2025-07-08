import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { CreateOrderDto } from '../dto/create-order.dto';
import * as crypto from 'crypto';

interface PayPlusPaymentResponse {
  payment_page_link: string;
  page_request_uid: string;
  status: string;
}

interface PayPlusPaymentPayload {
  payment_page_request: {
    payment_page_uid: string;
    refURL_success: string;
    refURL_failure: string;
    refURL_callback: string;
    currency_code: string;
    amount: number;
    vat_amount: number;
    language_code: string;
    customer: {
      customer_name: string;
      email: string;
      phone: string;
      address: {
        country: string;
        city: string;
        street: string;
        house_number: string;
        postal_code: string;
      };
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      vat_type: number;
    }>;
    more_info: string; // This will be our order ID
    custom_fields: any;
    charge_method: number;
    send_email_approval: boolean;
    send_email_failure: boolean;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getPaymentLink({
    createOrderDto,
    orderId,
  }: {
    createOrderDto: CreateOrderDto;
    orderId: string;
  }): Promise<PayPlusPaymentResponse> {
    const apiKey = this.configService.get<string>('PAYPLUS_API_KEY');
    const secretKey = this.configService.get<string>('PAYPLUS_SECRET_KEY');
    const paymentPageUid = this.configService.get<string>(
      'PAYPLUS_PAYMENT_PAGE_UID',
    );
    // Get environment-specific URLs
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const frontendUrl = this.getFrontendUrl(nodeEnv);
    const backendUrl = this.getBackendUrl();

    if (!apiKey || !secretKey || !paymentPageUid) {
      throw new BadRequestException('PayPlus credentials not configured');
    }

    const payload: PayPlusPaymentPayload = {
      payment_page_request: {
        payment_page_uid: paymentPageUid,
        refURL_success: `${frontendUrl}/payment/success?orderId=${orderId}`,
        refURL_failure: `${frontendUrl}/payment/failure?orderId=${orderId}`,
        refURL_callback: `${backendUrl}/api/orders/webhook/payment-notification`,
        currency_code: 'ILS',
        amount: createOrderDto.totalPrice,
        vat_amount: this.calculateVAT(createOrderDto.totalPrice),
        language_code: 'he',
        customer: {
          customer_name: `${createOrderDto.customer.firstName} ${createOrderDto.customer.lastName}`,
          email: createOrderDto.customer.email,
          phone: createOrderDto.customer.phone,
          address: {
            country: createOrderDto.customer.address.country || 'Israel',
            city: createOrderDto.customer.address.city,
            street: createOrderDto.customer.address.street,
            house_number: createOrderDto.customer.address.streetNum,
            postal_code: createOrderDto.customer.address.postal_code || '',
          },
        },
        items: createOrderDto.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          vat_type: 1, // Standard VAT
        })),
        more_info: orderId, // Critical: This links PayPlus response back to our order
        custom_fields: {
          order_source: 'web',
          customer_id: createOrderDto.customer.email,
        },
        charge_method: 1, // Immediate charge
        send_email_approval: true,
        send_email_failure: true,
      },
    };

    try {
      this.logger.log(`Creating PayPlus payment for order ${orderId}`);

      const response = await firstValueFrom(
        this.httpService
          .post<PayPlusPaymentResponse>(
            `${this.getPayPlusApiUrl()}/PaymentPages/generateLink`,
            payload,
            {
              headers: {
                'api-key': apiKey,
                'secret-key': secretKey,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error) => {
              this.logger.error(
                'PayPlus API error:',
                error.response?.data || error.message,
              );
              throw new BadRequestException('Failed to create payment link');
            }),
          ),
      );

      this.logger.log(
        `PayPlus payment link created: ${response.data.page_request_uid}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error creating PayPlus payment:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secretKey = this.configService.get<string>('PAYPLUS_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn(
        'PayPlus secret key not configured for webhook verification',
      );
      return false;
    }

    try {
      // PayPlus uses base64 format, not hex - per their documentation
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('base64');

      return expectedSignature === signature;
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  private calculateVAT(amount: number): number {
    // Israel VAT is 18%
    return Math.round(amount * 0.18 * 100) / 100;
  }

  private getFrontendUrl(nodeEnv: string): string {
    switch (nodeEnv) {
      case 'production':
        return this.configService.get<string>(
          'FRONTEND_URL_PRODUCTION',
          this.configService.get<string>(
            'FRONTEND_URL_ON_RENDER',
            'https://tenat.co.il',
          ),
        );
      case 'development':
      default:
        return this.configService.get<string>(
          'FRONTEND_URL_DEVELOPMENT',
          'http://localhost:5173',
        );
    }
  }

  private getBackendUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL');
    const baseUrlNgrok = this.configService.get<string>('BASE_URL_NGROK');

    // Prefer ngrok URL if available (useful for webhook testing)
    if (baseUrlNgrok && baseUrlNgrok.trim()) {
      return baseUrlNgrok;
    }

    // Use APP_URL if set
    if (appUrl && appUrl.trim()) {
      return appUrl;
    }

    // Fallback to localhost
    const port = this.configService.get<string>('PORT', '3000');
    return `http://localhost:${port}`;
  }

  private getPayPlusApiUrl(): string {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    switch (nodeEnv) {
      case 'production':
        return this.configService.get<string>(
          'PAYPLUS_PROD_API_URL',
          'https://restapi.payplus.co.il/api/v1.0',
        );
      case 'development':
      default:
        return this.configService.get<string>(
          'PAYPLUS_DEV_API_URL',
          'https://restapidev.payplus.co.il/api/v1.0',
        );
    }
  }
}
