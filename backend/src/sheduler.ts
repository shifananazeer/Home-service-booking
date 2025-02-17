// scheduler.ts

import cron from 'node-cron';
import { deleteExpiredSlots } from './infrastructure/services/availabilityService';
import { AvailabilityRepositoryImpl } from './infrastructure/database/repositories/AvailabilityRepositoryIml'; 

const availabilityRepository = new AvailabilityRepositoryImpl();
cron.schedule('0 0 * * *', async () => {
    console.log('Deleting expired slots...');
    try {
        await deleteExpiredSlots(availabilityRepository);
        console.log('Expired slots deleted successfully.');
    } catch (error) {
        console.error('Error deleting expired slots:', error);
    }
});
