import { Controller, Get, Post, Query, Headers, Req, Body, ForbiddenException, BadRequestException } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { createHmac } from "node:crypto";
import { Throttle } from "@nestjs/throttler";
import { MetaService } from "./meta.service";
import { MetaLeadAdsService } from "./meta-lead-ads.service";
import { MetaOAuthService } from "./meta-oauth.service";
import { parseMetaSignedRequest } from "./meta-data-deletion";
import { Public } from "../../../core/auth/decorators/public.decorator";
import { SkipTenancy } from "../../../core/tenancy/skip-tenancy.decorator";

@Controller("webhooks/meta")
@Throttle({ default: { limit: 200, ttl: 60000 } })
@Public()
@SkipTenancy()
export class MetaController {
  constructor(
    private readonly meta: MetaService,
    private readonly metaLeadAds: MetaLeadAdsService,
    private readonly oauth: MetaOAuthService,
  ) {}

  @Post("data-deletion")
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async dataDeletion(@Body() body: { signed_request?: string }, @Req() req: Request) {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret || !body.signed_request) {
      throw new BadRequestException("Meta signed_request is required");
    }

    const payload = parseMetaSignedRequest(body.signed_request, appSecret);
    await this.oauth.handleDataDeletion(payload.user_id);
    const confirmationCode = createHmac("sha256", appSecret)
      .update(`${payload.user_id}:${Date.now()}`)
      .digest("hex")
      .slice(0, 32);
    const publicApiUrl = process.env.API_PUBLIC_URL?.replace(/\/$/, "")
      || `${req.protocol}://${req.get("host")}/api`;

    return {
      url: `${publicApiUrl}/webhooks/meta/data-deletion/status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    };
  }

  @Get("data-deletion/status")
  dataDeletionStatus(@Query("code") code?: string) {
    if (!code || !/^[a-f0-9]{32}$/.test(code)) throw new BadRequestException("Invalid confirmation code");
    return {
      confirmationCode: code,
      status: "completed",
      message: "La conexion Meta y sus credenciales asociadas fueron eliminadas o desactivadas.",
    };
  }

  @Get()
  verify(
    @Query("hub.mode") mode?: string,
    @Query("hub.verify_token") token?: string,
    @Query("hub.challenge") challenge?: string,
  ) {
    if (mode !== "subscribe" || !token || token !== process.env.META_WEBHOOK_VERIFY_TOKEN)
      throw new ForbiddenException();
    return challenge;
  }

  @Post()
  async receive(
    @Req() req: RawBodyRequest<Request>,
    @Headers("x-hub-signature-256") signature: string,
    @Body() payload: unknown,
  ) {
    this.meta.verify(req.rawBody ?? Buffer.alloc(0), signature ?? "");
    const messages = this.meta.normalize(payload as Parameters<MetaService["normalize"]>[0]);
    const replies = await this.meta.dispatch(messages);
    const leadResults = await this.metaLeadAds.processWebhook(payload as Parameters<MetaLeadAdsService["processWebhook"]>[0]);
    return { accepted: messages.length + leadResults.accepted, replies, leadResults };
  }
}
