import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkerState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    accessToken: string | null; // Updated to accessToken
    refreshToken: string | null; // Added refreshToken
    isVerified: boolean; // Optional: track verification status
}

const accessTokenFromStorage = localStorage.getItem('worker_access_token');
const refreshTokenFromStorage = localStorage.getItem('worker_refresh_token');

const initialState: WorkerState = {
    isLoading: false,
    error: null,
    success: false,
    accessToken: accessTokenFromStorage, // Updated to accessToken
    refreshToken: refreshTokenFromStorage, // Added refreshToken
    isVerified: false, // Initialize verification status
};

const workerSlice = createSlice({
    name: 'worker',
    initialState,
    reducers: {
        // Signup actions
        signupStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        signupSuccess: (state) => {
            state.isLoading = false;
            state.success = true;
        },
        signupFail: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        resetSignupState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
            state.accessToken = null; // Clear access token
            state.refreshToken = null; // Clear refresh token
        },
        otpVerifySuccess: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload; // Set access token on OTP verification
            state.success = true;
            state.isVerified = true; // Update verification status
        },

        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
            state.isLoading = false;
            state.success = true;
            state.accessToken = action.payload.accessToken; // Set access token
            state.refreshToken = action.payload.refreshToken; // Set refresh token
            localStorage.setItem('worker_access_token', action.payload.accessToken); // Store access token
            localStorage.setItem('worker_refresh_token', action.payload.refreshToken); // Store refresh token
        },
        loginFail: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.accessToken = null; // Clear access token on login failure
            state.refreshToken = null; // Clear refresh token on login failure
            localStorage.removeItem('worker_access_token'); // Remove access token from storage
            localStorage.removeItem('worker_refresh_token'); // Remove refresh token from storage
        },
        resetLoginState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
        },
        logout: (state) => {
            state.accessToken = null; // Clear access token
            state.refreshToken = null; // Clear refresh token
            state.success = false; // Reset success status
            state.isVerified = false; // Reset verification status
            localStorage.removeItem('worker_access_token'); // Remove access token from storage
            localStorage.removeItem('worker_refresh_token'); 
            localStorage.removeItem('workerId')// Remove refresh token from storage
        },
    },
});

export const {
    signupStart,
    signupSuccess,
    signupFail,
    resetSignupState,
    loginStart,
    loginSuccess,
    loginFail,
    resetLoginState,
    logout,
    otpVerifySuccess,
} = workerSlice.actions;

export default workerSlice.reducer;
