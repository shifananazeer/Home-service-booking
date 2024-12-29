// scheduler.ts

import cron from 'node-cron';
import { deleteExpiredSlots } from './infrastructure/services/availabilityService';
import { AvailabilityRepositoryImpl } from './infrastructure/database/repositories/AvailabilityRepositoryIml'; // Adjust this import according to your project structure


cron.schedule('0 0 * * *', async () => {
    console.log('Deleting expired slots...');
    try {
        await deleteExpiredSlots(AvailabilityRepositoryImpl);
        console.log('Expired slots deleted successfully.');
    } catch (error) {
        console.error('Error deleting expired slots:', error);
    }
});
