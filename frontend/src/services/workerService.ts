
import { SignupWorker } from "../interfaces/workerInterface";
import axiosInstance from "../utils/axiosInstance";



export const registerWorker = async (workerData : SignupWorker) => {
    console.log("workerData",workerData)
    try{
        const response = await axiosInstance.post('/workers/signup', workerData)

        return response.data;
    }catch (error:any){
        throw error.response?.data?.message ||'Error registering worker'
    }
}