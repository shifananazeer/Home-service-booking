import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
    name: string;
    email: string;
    token: string;
    
}

interface UserState {
    userData: UserData | null;
    loading: boolean;
    error: string | null;
}


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
    userData: getStoredUserData(), 
    loading: false,
    error: null,
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        
        loginStart: (state) => {
            state.loading = true;
            state.error = null; 
        },

        
        loginSuccess: (state, action: PayloadAction<UserData>) => {
            state.userData = action.payload;
            state.loading = false; 
            state.error = null; 
            try {
                localStorage.setItem('userData', JSON.stringify(action.payload));
            } catch (error) {
                console.error('Error saving userData to localStorage:', error);
            }
        },

        
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false; 
            state.error = action.payload; 
        },

       
        logout: (state) => {
            state.userData = null;
            state.error = null; 

            try {
                localStorage.removeItem('userData');
            } catch (error) {
                console.error('Error removing userData from localStorage:', error);
            }
        },

        
        clearUserData: (state) => {
            state.userData = null;
            state.error = null;

            try {
                localStorage.removeItem('userData');
            } catch (error) {
                console.error('Error removing userData from localStorage:', error);
            }
        },

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
