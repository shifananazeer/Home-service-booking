import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    error: null,
    success: false,
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
        },
    },
});

export const { signupStart, signupSuccess, signupFail, resetSignupState } = workerSlice.actions;

export default workerSlice.reducer;
