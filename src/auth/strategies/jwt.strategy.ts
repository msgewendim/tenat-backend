import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

export interface JwtPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  azp?: string;
  scope?: string;
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const issuerBaseUrl = configService.get<string>('ISSUER_BASE_URL');
    const audience = configService.get<string>('AUDIENCE');

    if (!issuerBaseUrl || !audience) {
      throw new Error(
        'Auth0 configuration missing: ISSUER_BASE_URL and AUDIENCE are required',
      );
    }

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerBaseUrl}.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: audience,
      issuer: issuerBaseUrl,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Basic token validation
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing subject');
    }

    // Check if token is from the correct issuer
    const expectedIssuer = this.configService.get<string>('ISSUER_BASE_URL');
    if (payload.iss !== expectedIssuer) {
      throw new UnauthorizedException('Invalid token issuer');
    }

    // Check audience
    const expectedAudience = this.configService.get<string>('AUDIENCE');
    if (payload.aud !== expectedAudience) {
      throw new UnauthorizedException('Invalid token audience');
    }

    // Return the payload which will be available as req.user
    return payload;
  }
}
