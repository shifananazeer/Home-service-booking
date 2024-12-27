import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    region: process.env.BACKET_REGION,
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const getKeyFromUrl = (url: string): string => {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); 
};
const deletePreviousProfilePic = async (currentProfilePicUrl?: string): Promise<void> => {
    if (currentProfilePicUrl) {
        const key = getKeyFromUrl(currentProfilePicUrl);
        const params = {
            Bucket: process.env.BACKET_NAME as string,
            Key: key,
        };
        
        try {
            await s3.deleteObject(params).promise();
            console.log(`Deleted previous profile picture: ${currentProfilePicUrl}`);
        } catch (error: any) {
            console.error('Error deleting previous profile picture:', error);
        }
    }
};

export const uploadProfilePic = async (file: Express.Multer.File, currentProfilePicUrl?: string): Promise<string> => {
    await deletePreviousProfilePic(currentProfilePicUrl);

    const params = {
        Bucket: process.env.BACKET_NAME as string,
        Key: `profile-pics/${Date.now()}_${file.originalname}`, 
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return Location; 
    } catch (error: any) {
        console.error('Error uploading to S3:', error);
        throw new Error(`Error uploading profile picture: ${error.message}`);
    }
};
