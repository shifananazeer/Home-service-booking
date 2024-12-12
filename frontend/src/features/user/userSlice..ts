import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    userData: { name: string; email: string; token: string } | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    userData: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!) : null,
    loading: false,
    error: null,
};

// User Slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.userData = null;
            localStorage.removeItem('userData');
        },
        setUserData: (state, action) => {
            state.userData = action.payload;
            localStorage.setItem('userData', JSON.stringify(action.payload));
        },
        clearUserData: (state) => {
            state.userData = null;
            localStorage.removeItem('userData');
        }
    },
});

export const { logout, setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;