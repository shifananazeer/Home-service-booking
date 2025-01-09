import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkerState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    accessToken: string | null; 
    refreshToken: string | null; 
    isVerified: boolean; 
}

const accessTokenFromStorage = localStorage.getItem('accessToken');
const refreshTokenFromStorage = localStorage.getItem('refreshToken');

const initialState: WorkerState = {
    isLoading: false,
    error: null,
    success: false,
    accessToken: accessTokenFromStorage, 
    refreshToken: refreshTokenFromStorage,
    isVerified: false, 
};

const workerSlice = createSlice({
    name: 'worker',
    initialState,
    reducers: {
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
            state.accessToken = null; 
            state.refreshToken = null; 
        },
        otpVerifySuccess: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload; 
            state.success = true;
            state.isVerified = true; 
        },

        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string, workerId:string}>) => {
            state.isLoading = false;
            state.success = true;
            state.accessToken = action.payload.accessToken; 
            state.refreshToken = action.payload.refreshToken; 
            localStorage.setItem('worker_accessToken', action.payload.accessToken); 
            localStorage.setItem('worker_refreshToken', action.payload.refreshToken); 
            localStorage.setItem('workerId' , action.payload.workerId)
        },
        loginFail: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.accessToken = null;
            state.refreshToken = null; 
            localStorage.removeItem('worker_accessToken'); 
            localStorage.removeItem('worker_refreshToken'); 
            localStorage.removeItem('workerId')
             localStorage.removeItem('email')
        },
        resetLoginState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
        },
        logout: (state) => {
            state.accessToken = null; 
            state.refreshToken = null; 
            state.success = false; 
            state.isVerified = false; 
            localStorage.removeItem('worker_accessToken'); 
            localStorage.removeItem('worker_refreshToken'); 
            localStorage.removeItem('workerId')
            localStorage.removeItem('email')
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
