import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3
const s3 = new AWS.S3({
    region: process.env.BACKET_REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

export const uploadChatImage = async (file: Express.Multer.File): Promise<string> => {
    const params = {
        Bucket: process.env.BACKET_NAME as string,
        Key: `chat-image/${uuidv4()}_${file.originalname}`, // Changed 'key' to 'Key'
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return Location;
    } catch (error: any) {
        console.error('Error uploading to S3', error);
        throw new Error(`Error uploading chat image: ${error.message}`);
    }
};
