import { Address } from "../../../domain/entities/Address";
import { AddressRepository } from "../../../domain/repositories/addressRepository";
import AddressModel from "../models/addressModel";
import { ObjectId } from 'mongodb';

export class AddressRepositoryImpl implements AddressRepository {
   

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
                return this.mapAddressToResponse(address);
            } else {
                address = await AddressModel.create({
                    userId,
                    ...updates,
                });
                return this.mapAddressToResponse(address);
            }
        } catch (error) {
            console.error("Error updating address:", error);
            throw new Error("Failed to update address");
        }
    }

    async findAddressByUserId(userId: string): Promise<Address | null> {
        const address = await AddressModel.findOne({ userId: new ObjectId(userId) }).exec();

        if (!address) {
            return null;
        }
        return this.mapAddressToResponse(address);
    }

    async updateLocation(latitude: number, longitude: number, workerId: string): Promise<Address | null> {
        try {
            if (!workerId) {
                throw new Error("Invalid workerId");
            }
            const address = await AddressModel.findOneAndUpdate(
                { userId: workerId },
                { $set: { 'location.latitude': latitude, 'location.longitude': longitude } },
                { new: true }
            );

            if (!address) {
                const newAddress = new AddressModel({
                    userId: workerId,
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    }
                });
                const savedAddress = await newAddress.save(); 
                return {
                    ...this.mapAddressToResponse(savedAddress),
                    location: {
                        latitude: savedAddress.location.latitude,
                        longitude: savedAddress.location.longitude
                    }
                } as Address; 
            }
            return {
                ...this.mapAddressToResponse(address),
                location: {
                    latitude: address.location.latitude,
                    longitude: address.location.longitude
                }
            } as Address;
        } catch (error) {
            console.error("Error updating location:", error);
            throw new Error("Failed to update location");
        }
    }

    async findAddressByWorkerId(userId: string): Promise<Address | null> {
        const address = await AddressModel.findOne({ userId: new ObjectId(userId) }).exec();

        if (!address) {
            return null;
        }
        return {
            ...this.mapAddressToResponse(address),
            location: address.location
        };
    }

  
    private mapAddressToResponse(address: any): Address {
        return {
            id: address.id.toString(),
            userId: address.userId.toString(),
            address: address.address,
            area: address.area,
            __v: address.__v,
        } as Address;
    }
}
