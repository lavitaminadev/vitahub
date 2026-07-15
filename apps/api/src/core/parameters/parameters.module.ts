import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterDefinition } from './parameter-definition.entity';
import { ParameterValue } from './parameter-value.entity';
import { ParameterResolver } from './parameter-resolver.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterDefinition, ParameterValue])],
  providers: [ParameterResolver],
  exports: [ParameterResolver, TypeOrmModule],
})
export class ParametersModule {}
