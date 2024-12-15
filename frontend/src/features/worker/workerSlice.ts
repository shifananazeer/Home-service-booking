import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface WorkerState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    token: string | null; // Added token to the state
}

const initialState: WorkerState = {
    isLoading: false,
    error: null,
    success: false,
    token: null, // Initialize token as null
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
        signupSuccess: (state,action: PayloadAction<string>) => {
            state.isLoading = false;
            state.success = true;
            state.token = action.payload; // Save token
            localStorage.setItem('worker_token', action.payload); // Persist token
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
        
        // Login actions
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state,action: PayloadAction<string>) => {
            state.isLoading = false;
            state.success = true;
            state.token = action.payload; // Save token
            localStorage.setItem('worker_token', action.payload); // Persist token
        },
        loginFail: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.token = null;
            localStorage.removeItem('worker_token'); // Remove token from storage
        },
        resetLoginState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.success = false;
        },
        logout: (state) => {
            state.token = null; // Clear token
            state.success = false; // Reset success state
            localStorage.removeItem('worker_token'); // Remove token from local storage
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
} = workerSlice.actions;

export default workerSlice.reducer;
