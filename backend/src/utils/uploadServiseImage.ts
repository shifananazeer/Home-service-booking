import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    region: process.env.BACKET_REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const getKeyFromUrl = (url: string): string => {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); 
};

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
            throw new Error('Error deleting previous image'); 
        }
    }
};

export const uploadServiceImage = async (file: Express.Multer.File, currentImageUrl?: string): Promise<string> => {
    if (currentImageUrl) {
        await deletePreviousServiceImage(currentImageUrl);
    }

    const params = {
        Bucket: process.env.BACKET_NAME as string,
        Key: `service-images/${uuidv4()}_${file.originalname}`, 
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return Location; 
    } catch (error: any) {
        console.error('Error uploading to S3:', error);
        throw new Error(`Error uploading service image: ${error.message}`); 
    }
};
