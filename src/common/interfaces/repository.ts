import { DeepPartial, EntityManager, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationMeta } from '../helpers/pagination.helper';

export interface CreateRecordGeneric<CreateRecordPayload> {
  createPayload: CreateRecordPayload;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export interface DeleteRecordGeneric<IdentifierOptions> {
  identifierOptions: IdentifierOptions;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export interface ListRecordGeneric<FilterRecordOptions> {
  filterRecordOptions: FilterRecordOptions;
  relations?: object;
  paginationPayload?: {
    limit: number;
    page: number;
  };
}

export interface UpdateManyRecordGeneric<
  UpdateManyRecordPayload,
  IdentifierOptions,
> {
  updateManyPayload: UpdateManyRecordPayload;
  identifierOptions: IdentifierOptions;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export interface UpdateRecordGeneric<UpdateRecordPayload, IdentifierOptions> {
  updatePayload: UpdateRecordPayload;
  identifierOptions: IdentifierOptions;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export interface UpsertRecordGeneric<UpsertRecordPayload, IdentifierOptions> {
  upsertPayload: UpsertRecordPayload;
  identifierOptions: IdentifierOptions;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
}

export interface IRepository<T> {
  create(
    createRecordOptions: CreateRecordGeneric<DeepPartial<T>>,
  ): Promise<T | null>;
  update(
    updateRecordOptions: UpdateRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<T | null>;
  delete(
    deleteRecordOptions: DeleteRecordGeneric<FindOptionsWhere<T>>,
  ): Promise<void>;
  get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: object,
  ): Promise<T | null>;
  list(
    listRecordOptions: ListRecordGeneric<object>,
  ): Promise<{ payload: T[]; paginationMeta: Partial<PaginationMeta> }>;
  exists(where: FindOptionsWhere<T>): Promise<boolean>;
  count(where: FindOptionsWhere<T>): Promise<number>;
  updateMany(
    updateManyRecordOptions: UpdateManyRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<void>;
}
