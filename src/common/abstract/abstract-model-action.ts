import {
  Repository,
  EntityTarget,
  ObjectLiteral,
  DeepPartial,
  FindOptionsWhere,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  CreateRecordGeneric,
  DeleteRecordGeneric,
  IRepository,
  ListRecordGeneric,
  UpdateManyRecordGeneric,
  UpdateRecordGeneric,
} from '../interfaces/repository';
import {
  computePaginationMeta,
  PaginationMeta,
} from '../helpers/pagination.helper';

export abstract class AbstractModelAction<T extends ObjectLiteral>
  implements IRepository<T>
{
  model: EntityTarget<T>;

  constructor(
    protected readonly repository: Repository<T>,
    model: EntityTarget<T>,
  ) {
    this.model = model;
  }

  async create(
    createRecordOptions: CreateRecordGeneric<DeepPartial<T>>,
  ): Promise<T | null> {
    const { createPayload, transactionOptions } = createRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    const response: T | null = (await modelRepository.save(
      createPayload,
    )) as T | null;
    return response;
  }

  async update(
    updateRecordOptions: UpdateRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<T | null> {
    const { updatePayload, identifierOptions, transactionOptions } =
      updateRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    await modelRepository.update(identifierOptions, updatePayload);
    return await modelRepository.findOne({ where: identifierOptions });
  }

  async delete(
    deleteRecordOptions: DeleteRecordGeneric<FindOptionsWhere<T>>,
  ): Promise<void> {
    const { identifierOptions, transactionOptions } = deleteRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    await modelRepository.delete(identifierOptions);
  }

  async get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: object,
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: getRecordIdentifierOptions,
      ...queryOptions,
      relations,
    });
  }

  async list(
    listRecordOptions: ListRecordGeneric<object>,
  ): Promise<{ payload: T[]; paginationMeta: Partial<PaginationMeta> }> {
    const { paginationPayload, filterRecordOptions, relations } =
      listRecordOptions;

    if (paginationPayload) {
      const { limit, page } = paginationPayload;
      const query = await this.repository.find({
        where: filterRecordOptions,
        relations,
        take: +limit,
        skip: +limit * (+page - 1),
      });

      const total = await this.repository.count({ where: filterRecordOptions });

      return {
        payload: query,
        paginationMeta: computePaginationMeta(total, +limit, +page),
      };
    }

    const query = await this.repository.find({
      where: filterRecordOptions,
      relations,
    });

    return {
      payload: query,
      paginationMeta: { total: query.length },
    };
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return (await this.repository.count({ where })) > 0;
  }

  async updateMany(
    updateManyRecordOptions: UpdateManyRecordGeneric<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ): Promise<void> {
    const { updateManyPayload, identifierOptions, transactionOptions } =
      updateManyRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    await modelRepository.update(identifierOptions, updateManyPayload);
  }

  async count(where: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }
}
