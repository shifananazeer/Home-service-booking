import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkerState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
    accessToken: string | null; 
    refreshToken: string | null; 
    isVerified: boolean; 
    workerData:WorkerData | null;
}
interface WorkerData {
    name: string;
    email: string;
    accessToken: string;   
    refreshToken: string; 
    role?: string; 
    
}

const getStoredWorkerData = (): WorkerData | null => {
    try {
        const storedUserData = localStorage.getItem('workerData');
        return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        return null;
    }
};

const accessTokenFromStorage = localStorage.getItem('accessToken');
const refreshTokenFromStorage = localStorage.getItem('refreshToken');

const initialState: WorkerState = {
    isLoading: false,
    error: null,
    success: false,
    accessToken: accessTokenFromStorage, 
    refreshToken: refreshTokenFromStorage,
    isVerified: false, 
    workerData:getStoredWorkerData()
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
        loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; workerId: string; workerName: string; workerEmail: string; workerRole?: string }>) => {
            state.isLoading = false;
            state.success = true;
            
            const { accessToken, refreshToken, workerId, workerName, workerEmail, workerRole } = action.payload;
        
            // Update state
            state.workerData = {
                name: workerName,
                email: workerEmail,
                role: workerRole,
                accessToken,
                refreshToken,
            };
        
            // Store in localStorage
            localStorage.setItem('worker_accessToken', accessToken);
            localStorage.setItem('worker_refreshToken', refreshToken);
            localStorage.setItem('workerId', workerId);
            localStorage.setItem('workerData', JSON.stringify({
                name: workerName,
                email: workerEmail,
                role: workerRole,
            }));
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
            localStorage.removeItem('workerData');
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
