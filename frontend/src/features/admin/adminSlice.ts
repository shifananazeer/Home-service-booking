import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    token: string | null; 
}


const initialState: AdminState = {
    isLoading: false,
    error: null,
    success: false,
    token: localStorage.getItem('admin_token') || null, 
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
       
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.success = true;
            state.token = action.payload; 
            
        },
        loginFail: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.error = action.payload; 
            state.token = null; 
            localStorage.removeItem('admin_token'); 
        },
        logout: (state) => {
            state.isLoading = false; 
            state.token = null; 
            state.success = false; 
            state.error = null; 
          
        },
    },
});


export const {
    loginStart,
    loginSuccess,
    loginFail,
    logout,
} = adminSlice.actions;


export default adminSlice.reducer;
