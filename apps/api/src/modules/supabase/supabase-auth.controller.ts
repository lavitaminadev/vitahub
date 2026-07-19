import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from './supabase.service';
import { Public } from '../../core/auth/decorators/public.decorator';

class SupabaseRegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @MinLength(2) name: string;
}

class SupabaseLoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

@ApiTags('Supabase Auth')
@Controller('auth/supabase')
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class SupabaseAuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly supabase: SupabaseService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar usuario via Supabase' })
  async register(@Body() dto: SupabaseRegisterDto) {
    try {
      await this.supabase.registerUser(dto.email, dto.password, dto.name);
    } catch (err: any) {
      throw new ConflictException(err.message || 'Supabase registration failed');
    }

    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesion via Supabase' })
  async login(@Body() dto: SupabaseLoginDto) {
    try {
      await this.supabase.signInWithPassword(dto.email, dto.password);
    } catch {
      throw new UnauthorizedException('Invalid Supabase credentials');
    }

    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user);
  }
}
