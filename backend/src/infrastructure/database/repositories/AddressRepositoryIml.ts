import { Address } from "../../../domain/entities/Address";
import { AddressRepository } from "../../../domain/repositories/addressRepository";
import AddressModel from "../models/addressModel";
import { ObjectId } from 'mongodb'; 
export const AddressRepositoryImpl: AddressRepository = {
    async updateAddress(userId: string, updates: Partial<Address>): Promise<Address | null> {
        try {
            let address = await AddressModel.findOne({ userId });
    
            if (address) {
                address = await AddressModel.findOneAndUpdate(
                    { userId },
                    { $set: updates },
                    { new: true } 
                );
                if (!address) {
                    return null;
                }
                return {
                    id: address.id.toString(), 
                    userId: address.userId.toString(),
                    address: address.address,
                    area: address.area,
                    __v: address.__v,
                } as Address; 
            } else {
                address = await AddressModel.create({
                    userId,
                    ...updates,
                });
                return {
                    id: address.id.toString(), 
                    userId: address.userId.toString(), 
                    address: address.address,
                    area: address.area,
                    __v: address.__v,
                } as Address; 
            }
        } catch (error) {
            console.error("Error updating address:", error);
            throw new Error("Failed to update address");
        }
    },

    findAddressByUserId: async (userId: string): Promise<Address | null> => {
        const address = await AddressModel.findOne({ userId: new ObjectId(userId) }).exec(); 

        if (!address) {
            return null;
        }
        return {
            id: address.id.toString(),
            userId: address.userId.toString(),
            address: address.address,
            area: address.area,
            __v: address.__v,
        };
    },
    async updateLocation(latitude:number , longitude:number , workerId:string): Promise<Address | null> {
        try {
            const address = await AddressModel.findOneAndUpdate(
                { userId: workerId }, 
                { $set: { 'location.latitude': latitude, 'location.longitude': longitude } }, 
                { new: true } 
            );
    
            if (!address) {
                return null; 
            }
            return {
                id: address.id.toString(), 
                userId: address.userId.toString(),
                address: address.address,
                area: address.area,
                __v: address.__v,
                location: {
                    latitude: address.location.latitude, 
                    longitude: address.location.longitude 
                }
            } as Address;
        } catch (error) {
            console.error("Error updating location:", error);
            throw new Error("Failed to update location");
        }
    },

    findAddressByWorkerId: async (userId: string): Promise<Address | null> => {
        const address = await AddressModel.findOne({ userId: new ObjectId(userId) }).exec(); 

        if (!address) {
            return null;
        }
        return {
            id: address.id.toString(),
            userId: address.userId.toString(),
            address: address.address,
            area: address.area,
            location: address.location,
            __v: address.__v,
        };
    },
};