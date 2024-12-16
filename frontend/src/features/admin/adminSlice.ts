import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    token: string | null; // Added token to the state
}

// Retrieve token from localStorage on initialization
const initialState: AdminState = {
    isLoading: false,
    error: null,
    success: false,
    token: localStorage.getItem('admin_token') || null, // Initialize token from localStorage
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // Login actions
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.success = true;
            state.token = action.payload; // Save token
            localStorage.setItem('admin_token', action.payload); // Persist token
        },
        loginFail: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload; // Set error message
            state.token = null; // Clear token on login failure
            localStorage.removeItem('admin_token'); // Remove token from local storage
        },
        logout: (state) => {
            state.isLoading = false; // Reset loading state
            state.token = null; // Clear token
            state.success = false; // Reset success state
            state.error = null; // Clear any existing error
            localStorage.removeItem('admin_token'); // Remove token from local storage
        },
    },
});

// Export actions
export const {
    loginStart,
    loginSuccess,
    loginFail,
    logout,
} = adminSlice.actions;

// Export the reducer
export default adminSlice.reducer;
