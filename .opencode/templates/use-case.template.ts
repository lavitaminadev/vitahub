import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {{Entity}} } from '../domain/{{entity}}.entity';
import { Create{{Entity}}Dto } from '../api/create-{{entity}}.dto';

@Injectable()
export class Create{{Entity}}UseCase {
  constructor(
    @InjectRepository({{Entity}})
    private readonly repo: Repository<{{Entity}}>,
  ) {}

  async execute(dto: Create{{Entity}}Dto, organizationId: string): Promise<{{Entity}}> {
    const entity = this.repo.create({
      ...dto,
      organizationId,
    });
    return this.repo.save(entity);
  }
}
