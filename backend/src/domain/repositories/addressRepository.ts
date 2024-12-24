import { Address } from "../entities/Address";

export interface AddressRepository {
    updateAddress(userId: string, updates: Partial<Address>): Promise<Address | null>;
    findAddressByUserId(userId: string): Promise<Address| null>;
    updateLocation(latitude:number , longitude:number , workerId: string) :Promise<Address| null>;
}