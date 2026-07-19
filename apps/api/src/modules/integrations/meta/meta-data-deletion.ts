import { createHmac, timingSafeEqual } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';

export interface MetaSignedRequestPayload {
  algorithm: string;
  user_id: string;
  issued_at?: number;
}

export function parseMetaSignedRequest(signedRequest: string, appSecret: string): MetaSignedRequestPayload {
  const [encodedSignature, encodedPayload, ...extra] = signedRequest.split('.');
  if (!encodedSignature || !encodedPayload || extra.length > 0) {
    throw new UnauthorizedException('Invalid Meta signed request');
  }

  const expected = createHmac('sha256', appSecret).update(encodedPayload).digest();
  const received = Buffer.from(encodedSignature, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new UnauthorizedException('Invalid Meta signed request');
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as MetaSignedRequestPayload;
    if (payload.algorithm?.toUpperCase() !== 'HMAC-SHA256' || !payload.user_id) {
      throw new Error('Invalid payload');
    }
    return payload;
  } catch {
    throw new UnauthorizedException('Invalid Meta signed request');
  }
}
