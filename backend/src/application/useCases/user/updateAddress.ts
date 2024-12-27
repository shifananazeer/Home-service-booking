import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"
import AddressModel from "../../../infrastructure/database/models/addressModel"
import { AddressRepositoryImpl } from "../../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../../domain/entities/Address";

export const upadteAddress = async(userId : string , address: string, area: string) => {
    try {
        const updatedAddress = await AddressRepositoryImpl.updateAddress(userId,{ address, area });

        if (!updatedAddress) {
            return {
                success: false,
                message: 'Address not found or could not be updated',
            };
        }
        return {
            success: true,
            updatedAddress,
        };
    } catch (error) {
        console.error('Error in updateAddressUseCase:', error);

        return {
            success: false,
            message: 'Failed to update the address due to a server error',
        };
    }
}

interface AddressResponse {
    message: string;    
    address?: Address; 
}

export const userAddress = async (userId: string): Promise<AddressResponse> => {
    try {
        const address: Address | null = await AddressRepositoryImpl.findAddressByUserId(userId);
        if (!address) {
            return {
                message: "User doesn't have an address",
            };
        }
        return {
            message: "Address retrieved successfully",
            address: {
                id: address.id?.toString(),   
                userId: address.userId.toString(), 
                address: address.address,
                area: address.area,
                __v: address.__v,
            },
        };
    } catch (error) {
        console.error("Error fetching user address:", error);
        return {
            message: "An error occurred while fetching the address",
        };
    }
};