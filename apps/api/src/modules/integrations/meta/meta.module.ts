import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { MetaController } from "./meta.controller";
import { MetaService } from "./meta.service";

@Module({
  imports: [HttpModule],
  controllers: [MetaController],
  providers: [MetaService],
  exports: [MetaService],
})
export class MetaModule {}
