import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CustomHttpException } from 'src/common/custom.exception';
import * as SYS_MSG from 'src/common/system-messages';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { CreateUserRecordOptions, UserIdentifierMap, UserIdentifierType } from './interfaces/user.inteface';

@Injectable()
export class UserService {
  constructor(public readonly userRepository: UserRepository) {}

  async createUser(payload: CreateUserRecordOptions) {
    const user = await this.userRepository.create(payload);
    if(!user) {
      throw new CustomHttpException('Failed to create user', HttpStatus.EXPECTATION_FAILED)
    }
    return user
  }

async findUserByIdentifier<K extends UserIdentifierType>(
  identifierType: K, 
  identifier: UserIdentifierMap[K]
) {
  const query = { [identifierType]: identifier };
  const user = await this.userRepository.get(query);
  
  if (!user) {
    throw new CustomHttpException(
      SYS_MSG.RESOURCE_NOT_FOUD('User'),
      HttpStatus.NOT_FOUND,
    );
  }
  
  return user;
}

  async getUser(id: string) {
    const user = await this.findUserByIdentifier('id', id)
    return {
      message: SYS_MSG.RESOURCE_FETCHED('User'),
      data: user
    }
  }

  async updateUser(updateData: any, id: string) {
    await this.findUserByIdentifier('id', id)
    const updatedUser =await this.userRepository.update({
      updatePayload: updateData,
      identifierOptions: { id },
      transactionOptions: { useTransaction: false },
    });

    return {
      message: SYS_MSG.RESOURCE_UPDATED('User'),
      data: updatedUser
    }
  }

  async deleteUser(id: string) {
    await this.findUserByIdentifier('id', id)
    await this.userRepository.delete({
      identifierOptions: { id },
      transactionOptions: { useTransaction: false },
    });

    return {
      message: SYS_MSG.RESOURCE_DELETED('User')
    }
  }
}
