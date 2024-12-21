// services/availabilityService.ts

import { AvailabilityRepository } from '../../domain/repositories/availabilityRepository';

export const deleteExpiredSlots = async (repository: AvailabilityRepository): Promise<void> => {
    // Get the current date
    const currentDate = new Date();

    // Call the deleteExpiredSlots method in the repository
    await repository.deleteExpiredSlots(currentDate);
};
