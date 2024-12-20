import { UserRepositoryImpl } from "../../../infrastructure/database/repositories/UserRepositoryImpl"
import AddressModel from "../../../infrastructure/database/models/addressModel"
import { AddressRepositoryImpl } from "../../../infrastructure/database/repositories/AddressRepositoryIml";
import { Address } from "../../../domain/entities/Address";

export const upadteAddress = async(userId : string , address: string, area: string) => {
   

    try {
        // Call repository method to update address
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

// interface Address {
//     _id: string;       // ID of the address
//     userId: string;    // ID of the user that the address belongs to
//     address: string;    // The actual address
//     area: string;       // Area of the address
//     __v: number;       // Version key, usually present in MongoDB documents
// }

// Define the AddressResponse interface
interface AddressResponse {
    message: string;    // Message indicating the result of the operation
    address?: Address;  // Optional address object of type Address
}

export const userAddress = async (userId: string): Promise<AddressResponse> => {
    try {
        // Retrieve the address based on userId
        const address: Address | null = await AddressRepositoryImpl.findAddressByUserId(userId);

        // Check if the address was found
        if (!address) {
            return {
                message: "User doesn't have an address",
            };
        }

        // Return the retrieved address along with a success message
        return {
            message: "Address retrieved successfully",
            address: {
                id: address.id?.toString(),   // Convert ObjectId to string for type safety
                userId: address.userId.toString(), // Convert ObjectId to string if necessary
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