import { OAuth2Client } from "google-auth-library";




const verifyGoogleToken = async (token: string): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    googleId: string;
}> => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error('Invalid Google token');
    }

    return {
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        email: payload.email || '',
        googleId: payload.sub || '',
    };
};

export default verifyGoogleToken;
