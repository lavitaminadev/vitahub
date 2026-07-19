import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleController } from './google.controller';
import { Integration } from '../integration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration])],
  controllers: [GoogleController],
  providers: [GoogleOAuthService],
  exports: [GoogleOAuthService],
})
export class GoogleModule {}
