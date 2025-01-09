//   import { Admin } from "../entities/Admin";
// import { Booking } from "../entities/Booking";
// import { Service } from "../entities/Service";
// import { User } from "../entities/User";
// import {Worker} from '../entities/worker'
// export interface AdminRepository {
//   findUsers(skip: number, limit: number, search: string): Promise<User[] | null>;
//     findWorkers(skip: number, limit: number, search: string):Promise<Worker[]|null>
//     findServices(skip: number , limit:number , search:string):Promise<Service[]|null>
//     countServices(search: string): Promise<number>
//     findByEmail(email:string) :Promise<Admin|null>
//     getBookings(params: { page: number; limit: number; search: string }): Promise<{ bookings: Booking[]; total: number }>;
// }