import AWS from 'aws-sdk';

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

// Function to delete the previous profile picture
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
    // Delete the previous profile picture if it exists
    await deletePreviousProfilePic(currentProfilePicUrl);

    const params = {
        Bucket: process.env.BACKET_NAME as string,
        Key: `profile-pics/${Date.now()}_${file.originalname}`, // Ensure unique file name
        Body: file.buffer,
        ContentType: file.mimetype,
        // Removed the ACL line to comply with bucket policy
    };

    try {
        const { Location } = await s3.upload(params).promise();
        return Location; // Return the URL of the uploaded image
    } catch (error: any) {
        console.error('Error uploading to S3:', error);
        throw new Error(`Error uploading profile picture: ${error.message}`);
    }
};
