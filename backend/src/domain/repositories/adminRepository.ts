  import { User } from "../entities/User";
import {Worker} from '../entities/worker'
export interface AdminRepository {
  findUsers(skip: number, limit: number, search: string): Promise<User[] | null>;
    findWorkers(skip: number, limit: number, search: string):Promise<Worker[]|null>
}