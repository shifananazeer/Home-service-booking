import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
    name: string;
    email: string;
    token: string;
    // Add other properties as necessary
}

interface UserState {
    userData: UserData | null;
    loading: boolean;
    error: string | null;
}

// Get stored user data safely
const getStoredUserData = (): UserData | null => {
    try {
        const storedUserData = localStorage.getItem('userData');
        return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        return null;
    }
};

const initialState: UserState = {
    userData: getStoredUserData(), // Use the safe function
    loading: false,
    error: null,
};

// User Slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Handles the start of the login process
        loginStart: (state) => {
            state.loading = true;
            state.error = null; // Clear any previous errors
        },

        // Handles a successful login
        loginSuccess: (state, action: PayloadAction<UserData>) => {
            state.userData = action.payload;
            state.loading = false; // Stop loading
            state.error = null; // Clear any previous errors

            try {
                localStorage.setItem('userData', JSON.stringify(action.payload));
            } catch (error) {
                console.error('Error saving userData to localStorage:', error);
            }
        },

        // Handles a login failure
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false; // Stop loading
            state.error = action.payload; // Set the error message
        },

        // Handles logout and clearing user data
        logout: (state) => {
            state.userData = null;
            state.error = null; // Clear error on logout

            try {
                localStorage.removeItem('userData');
            } catch (error) {
                console.error('Error removing userData from localStorage:', error);
            }
        },

        // Clear user data explicitly (optional action)
        clearUserData: (state) => {
            state.userData = null;
            state.error = null;

            try {
                localStorage.removeItem('userData');
            } catch (error) {
                console.error('Error removing userData from localStorage:', error);
            }
        },

        // Set user data explicitly (e.g., for rehydration or updates)
        setUserData: (state, action: PayloadAction<UserData>) => {
            state.userData = action.payload;
            try {
                localStorage.setItem('userData', JSON.stringify(action.payload));
            } catch (error) {
                console.error('Error saving userData to localStorage:', error);
            }
        },
    },
});

export const { 
    loginStart, 
    loginSuccess, 
    setUserData, 
    loginFailure, 
    logout, 
    clearUserData 
} = userSlice.actions;

export default userSlice.reducer;
