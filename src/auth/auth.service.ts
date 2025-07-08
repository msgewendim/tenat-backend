import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './strategies/jwt.strategy';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  /**
   * Get user info from Auth0 using the access token
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const issuerBaseUrl = this.configService.get<string>('ISSUER_BASE_URL');
      const response = await axios.get(`${issuerBaseUrl}userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException(
        'Failed to fetch user info from Auth0',
        error,
      );
    }
  }

  /**
   * Validate if user has required permissions
   */
  validatePermissions(
    user: JwtPayload,
    requiredPermissions: string[],
  ): boolean {
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }

    return requiredPermissions.every((permission) =>
      user.permissions!.includes(permission),
    );
  }

  /**
   * Extract user ID from JWT payload
   */
  getUserId(user: JwtPayload): string {
    return user.sub;
  }

  /**
   * Check if user email is verified
   */
  isEmailVerified(user: JwtPayload): boolean {
    return user.email_verified === true;
  }

  /**
   * Get user email from JWT payload
   */
  getUserEmail(user: JwtPayload): string | undefined {
    return user.email;
  }
}
