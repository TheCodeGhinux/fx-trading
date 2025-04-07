import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { AbstractModelAction } from 'src/common/abstract/abstract-model-action';

@Injectable()
export class OtpRepository extends AbstractModelAction<Otp> {
  constructor(
    @InjectRepository(Otp)
    repository: Repository<Otp>,
  ) {
    super(repository, Otp);
  }
}