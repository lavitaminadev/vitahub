import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brief } from './brief.entity';
import { BriefsController } from './briefs.controller';
import { BriefsService } from './briefs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brief])],
  controllers: [BriefsController],
  providers: [BriefsService],
})
export class BriefsModule {}
