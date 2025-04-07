import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from 'src/common/abstract/abstract-model-action';
import { Repository } from 'typeorm';
import { IRepository } from 'src/common/interfaces/repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends AbstractModelAction<User> implements IRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository, User);
  }
}
