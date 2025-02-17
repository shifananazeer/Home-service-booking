import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook , useDispatch , useSelector } from "react-redux";
import userReducer from '../features/user/userSlice.'
import workerReducer from '../features/worker/workerSlice'
import adminReducer from '../features/admin/adminSlice'
export const store = configureStore({
    reducer: {
        user: userReducer,
        worker: workerReducer,
        admin:adminReducer,
    },
})

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;