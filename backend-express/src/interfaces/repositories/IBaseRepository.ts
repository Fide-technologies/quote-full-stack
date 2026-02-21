import type mongoose from "mongoose";

export interface IBaseRepository<T> {
    create(item: Partial<T>): Promise<mongoose.HydratedDocument<T>>;
    findOne(filter: mongoose.QueryFilter<T>): Promise<mongoose.HydratedDocument<T> | null>;
    update(filter: mongoose.QueryFilter<T>, item: mongoose.UpdateQuery<T>): Promise<mongoose.UpdateWriteOpResult>;
    deleteOne(filter: mongoose.QueryFilter<T>): Promise<mongoose.DeleteResult>;
    findAll(filter?: mongoose.QueryFilter<T>): Promise<mongoose.HydratedDocument<T>[]>;
}
