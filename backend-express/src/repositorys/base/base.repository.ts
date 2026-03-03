import { injectable, unmanaged } from "inversify";
import type { Model, HydratedDocument, UpdateQuery, QueryFilter, UpdateWriteOpResult, DeleteResult } from "mongoose";
import type { IBaseRepository } from "@/interfaces";

@injectable()
export abstract class MongooseBaseRepository<T> implements IBaseRepository<T> {
    constructor(@unmanaged() protected readonly model: Model<T>) { }

    async create(item: Partial<T>): Promise<HydratedDocument<T>> {
        return await this.model.create(item);
    }

    async findOne(filter: QueryFilter<T>): Promise<HydratedDocument<T> | null> {
        return await this.model.findOne(filter);
    }

    async update(filter: QueryFilter<T>, item: UpdateQuery<T>): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, item);
    }

    async deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }

    async findAll(filter: QueryFilter<T> = {}): Promise<HydratedDocument<T>[]> {
        return await this.model.find(filter);
    }
}
