import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface WorkerState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    token: string | null; 
}
const tokenFromStorage = localStorage.getItem('worker_token');

const initialState: WorkerState = {
    isLoading: false,
    error: null,
    success: false,
    token: tokenFromStorage, 
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
            state.token = null;
        },
        otpVerifySuccess: (state, action) => {
            state.token = action.payload; 
            state.success = true;
        },
        
       
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state,action: PayloadAction<string>) => {
            state.isLoading = false;
            state.success = true;
            state.token = action.payload; 
            localStorage.setItem('worker_token', action.payload); 
        },
        loginFail: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.token = null;
            localStorage.removeItem('worker_token'); 
        },
        resetLoginState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
        },
        logout: (state) => {
            state.token = null; 
            state.success = false; 
            localStorage.removeItem('worker_token'); 
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
