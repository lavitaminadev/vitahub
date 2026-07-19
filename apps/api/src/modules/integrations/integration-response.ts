import { Integration } from './integration.entity';
import { BadRequestException } from '@nestjs/common';

const SECRET_CONFIG_KEYS = new Set([
  'accessToken',
  'refreshToken',
  'clientSecret',
  'apiKey',
  'token',
]);

export function toIntegrationResponse(integration: Integration): Integration {
  const config = Object.fromEntries(
    Object.entries(integration.config ?? {}).filter(([key]) => !SECRET_CONFIG_KEYS.has(key)),
  );
  return { ...integration, config };
}

export function assertConfigHasNoSecrets(config?: Record<string, unknown>): void {
  if (!config) return;
  const secretKey = Object.keys(config).find((key) => SECRET_CONFIG_KEYS.has(key));
  if (secretKey) {
    throw new BadRequestException(`Integration secret '${secretKey}' must be configured through its OAuth flow`);
  }
}
