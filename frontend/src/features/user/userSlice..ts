import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
    name: string;
    email: string;
    accessToken: string;   
    refreshToken: string; 
    role?: string; 
    
}

interface UserState {
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    accessToken: string | null;   
    refreshToken: string | null; 
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

const accessTokenFromStorage = localStorage.getItem('accessToken');
const refreshTokenFromStorage = localStorage.getItem('refreshToken');

const initialState: UserState = {
    userData: getStoredUserData(), 
    loading: false,
    error: null,
    accessToken: accessTokenFromStorage, 
    refreshToken: refreshTokenFromStorage,
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
            state.loading = false;
            state.accessToken = null;
            state.refreshToken = null;

            // try {
            //  localStorage.removeItem('userData');
            //     localStorage.removeItem('user_Id')
            //     localStorage.removeItem('accessToken')
            //     localStorage.removeItem('refreshToken')
            // } catch (error) {
            //     console.error('Error removing data from localStorage during logout:', error);
            // }
        },

        
        clearUserData: (state) => {
            state.userData = null;
            state.error = null;
            try {
                localStorage.removeItem('userData');
                localStorage.removeItem('user_Id')
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
