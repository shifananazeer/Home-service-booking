  import { User } from "../entities/User";
import {Worker} from '../entities/worker'
export interface AdminRepository {
    findUsers(): Promise<User[]|null>,
    findWorkers():Promise<Worker[]|null>
}