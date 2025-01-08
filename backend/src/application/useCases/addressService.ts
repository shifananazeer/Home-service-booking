import { UserRepositoryImpl } from "../../infrastructure/database/repositories/UserRepositoryImpl";
import AddressModel from "../../infrastructure/database/models/addressModel";
import { AddressRepositoryImpl } from "../../infrastructure/database/repositories/AddressRepositoryIml"; 
import { Address } from "../../domain/entities/Address";


const addressRepository = new AddressRepositoryImpl();
interface AddressResponse {
    message: string;    
    address?: Address; 
}

export class AddressService {
    public async updateAddress(userId: string, address: string, area: string) {
        try {
            const updatedAddress = await addressRepository.updateAddress(userId, { address, area });

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

    public async userAddress(userId: string): Promise<{ message: string; address?: Address }> {
        try {
            const address: Address | null = await addressRepository.findAddressByUserId(userId);
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
    }

    public async updateLocation(workerId: string, latitude: number, longitude: number) {
        try {
            const updatedAddress = await addressRepository.updateLocation(latitude, longitude, workerId);

            if (!updatedAddress) {
                return {
                    success: false,
                    message: 'Address not found for the given worker ID or could not be updated',
                };
            }
            return {
                success: true,
                updatedAddress,
            };
        } catch (error) {
            console.error('Error in updateLocationUseCase:', error);
            return {
                success: false,
                message: 'Failed to update the location due to a server error',
            };
        }
    }

    
}



export const updateLocation = async (workerId: string, latitude: number, longitude: number) => {
    try {
        const updatedAddress = await addressRepository.updateLocation(latitude, longitude, workerId);

        if (!updatedAddress) {
            return {
                success: false,
                message: 'Address not found for the given worker ID or could not be updated',
            };
        }
        return {
            success: true,
            updatedAddress,
        };
    } catch (error) {
        console.error('Error in updateLocationUseCase:', error);
        return {
            success: false,
            message: 'Failed to update the location due to a server error',
        };
    }
};

interface AddressResponse {
    message: string;    
    address?: Address; 
}export const updateAddress = async (userId: string, address: string, area: string) => {
    try {
        const updatedAddress = await addressRepository.updateAddress(userId, { address, area });

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
};
export const userAddress = async (userId: string): Promise<AddressResponse> => {
    try {
        const address: Address | null = await addressRepository.findAddressByUserId(userId);
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

