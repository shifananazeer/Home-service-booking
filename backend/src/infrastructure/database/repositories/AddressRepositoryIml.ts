import { Address } from "../../../domain/entities/Address";
import { AddressRepository } from "../../../domain/repositories/addressRepository";
import AddressModel from "../models/addressModel";
import { ObjectId } from 'mongodb'; 
export const AddressRepositoryImpl: AddressRepository = {
    async updateAddress(userId: string, updates: Partial<Address>): Promise<Address | null> {
        try {
            // Check if an address document exists for the user
            let address = await AddressModel.findOne({ userId });
    
            if (address) {
                // Update the existing address document
                address = await AddressModel.findOneAndUpdate(
                    { userId },
                    { $set: updates },
                    { new: true } // Return the updated document
                );
                if (!address) {
                    return null;
                }
                // Ensure the updated address is returned as per Address interface
                return {
                    id: address.id.toString(), // Convert ObjectId to string
                    userId: address.userId.toString(), // Convert ObjectId to string if userId is an ObjectId
                    address: address.address,
                    area: address.area,
                    __v: address.__v,
                } as Address; // Type assertion to Address
            } else {
                // Create a new address document if it doesn't exist
                address = await AddressModel.create({
                    userId,
                    ...updates,
                });
    
                // Return the newly created address with proper type conversion
                return {
                    id: address.id.toString(), // Convert ObjectId to string
                    userId: address.userId.toString(), // Convert ObjectId to string if userId is an ObjectId
                    address: address.address,
                    area: address.area,
                    __v: address.__v,
                } as Address; // Type assertion to Address
            }
        } catch (error) {
            console.error("Error updating address:", error);
            throw new Error("Failed to update address");
        }
    },
    findAddressByUserId: async (userId: string): Promise<Address | null> => {
        const address = await AddressModel.findOne({ userId: new ObjectId(userId) }).exec(); // Assuming userId is ObjectId

        if (!address) {
            return null;
        }

        // Map the address to your Address interface
        return {
            id: address.id.toString(),
            userId: address.userId.toString(), // Convert ObjectId to string if needed
            address: address.address,
            area: address.area,
            __v: address.__v,
        };
    },

    // Add additional methods as needed
};