import { Controller, Get, Post, Query, Headers, Req, Body, ForbiddenException } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { MetaService } from "./meta.service";

@Controller("webhooks/meta")
export class MetaController {
  constructor(private readonly meta: MetaService) {}

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
    return { accepted: messages.length, replies };
  }
}
