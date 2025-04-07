import { CreateRecordGeneric } from "src/common/interfaces/repository";

export interface UserInterface {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
}


export type UserIdentifierType = 'id' | 'email';

export interface UserIdentifierMap {
  id: string;
  email: string;
};

interface CreateUserRecordPayload extends Partial<UserInterface> {}

export interface CreateUserRecordOptions extends CreateRecordGeneric<CreateUserRecordPayload> {}
