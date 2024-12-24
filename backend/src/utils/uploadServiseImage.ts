import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3
const s3 = new AWS.S3({
    region: process.env.BACKET_REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Function to extract the S3 key from the URL
const getKeyFromUrl = (url: string): string => {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // This removes the protocol and bucket name
};

// Function to delete the previous service image
const deletePreviousServiceImage = async (currentImageUrl?: string): Promise<void> => {
    if (currentImageUrl) {
        const key = getKeyFromUrl(currentImageUrl);
        const params = {
            Bucket: process.env.BACKET_NAME as string,
            Key: key,
        };

        try {
            await s3.deleteObject(params).promise();
            console.log(`Deleted previous service image: ${currentImageUrl}`);
        } catch (error: any) {
            console.error('Error deleting previous service image:', error);
            throw new Error('Error deleting previous image'); // More descriptive error
        }
    }
};

// Function to upload service image to S3
export const uploadServiceImage = async (file: Express.Multer.File, currentImageUrl?: string): Promise<string> => {
    // Delete the previous service image if it exists
    await deletePreviousServiceImage(currentImageUrl);

    const params = {
        Bucket: process.env.BACKET_NAME as string,
        Key: `service-images/${uuidv4()}_${file.originalname}`, // Ensure unique file name
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return Location; // Return the URL of the uploaded image
    } catch (error: any) {
        console.error('Error uploading to S3:', error);
        throw new Error(`Error uploading service image: ${error.message}`); // More descriptive error
    }
};
