

import { AvailabilityRepository } from '../../domain/repositories/availabilityRepository';

export const deleteExpiredSlots = async (repository: AvailabilityRepository): Promise<void> => {
    const currentDate = new Date();
    await repository.deleteExpiredSlots(currentDate);
};
