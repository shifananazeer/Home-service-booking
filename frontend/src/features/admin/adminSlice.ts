import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    token: string | null; 
     adminData:AdminData| null;
}
interface AdminData {
    email:string ;
     role?:string|null;
     accessToken: string;   
     refreshToken: string; 
   
}
const getStoredAdminData = (): AdminData | null => {
    try {
        const storedUserData = localStorage.getItem('AdminData');
        return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        return null;
    }
};


const initialState: AdminState = {
    isLoading: false,
    error: null,
    success: false,
    token: localStorage.getItem('admin_token') || null, 
    adminData:getStoredAdminData()
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
        loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; adminId: string;  adminEmail: string; adminRole?: string }>) => {
            state.isLoading = false;
            state.success = true;
           
            const { accessToken, refreshToken, adminId, adminEmail, adminRole } = action.payload;
            state.adminData = {
           
                email: adminEmail,
                role: adminRole,
                accessToken,
                refreshToken,
            };
            localStorage.setItem('admin_accessToken', accessToken);
            localStorage.setItem('admin_refreshToken', refreshToken);
            localStorage.setItem('admin_Id', adminId);
            localStorage.setItem('adminData', JSON.stringify({
                email: adminEmail,
                role: adminRole,
            }));
            
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
            localStorage.removeItem('adminData');
            localStorage.removeItem('admin_accessToken'); 
            localStorage.removeItem('admin_refreshToken'); 
            localStorage.removeItem('admin_Id')
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
