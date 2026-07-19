import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

const META_ID = /^\d{1,32}$/;

export class MetaOAuthCallbackDto {
  @IsString()
  @MaxLength(4096)
  code: string;

  @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  redirectUri: string;

  @IsString()
  @MaxLength(4096)
  state: string;
}

export class MetaLeadSyncDto {
  @IsString()
  @Matches(META_ID)
  pageId: string;

  @IsString()
  @Matches(META_ID)
  leadgenId: string;
}

export class MetaPixelDto {
  @IsString()
  @Matches(META_ID)
  pixelId: string;
}

export class MetaAssetSelectionDto {
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) pageIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) instagramProfileIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) adAccountIds?: string[];
  @IsOptional() @IsString() primaryPageId?: string | null;
  @IsOptional() @IsString() primaryInstagramProfileId?: string | null;
  @IsOptional() @IsString() primaryAdAccountId?: string | null;
}
