import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getPaymentLink(payload: any): Promise<string> {
    const apiKey = this.configService.get<string>('PAYPLUS_API_KEY');
    const secretKey = this.configService.get<string>('PAYPLUS_SECRET_KEY');

    const response = await firstValueFrom(
      this.httpService.post(
        'https://rest.payplus.co.il/api/v1.0/PaymentPages/generateLink',
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}:${secretKey}`,
          },
        },
      ),
    );
    return response.data.payment_page_link;
  }
}
