import toast from "react-hot-toast";

const errorHandler = (error : any) => {
    console.log('Error', error)
    const errorMessage = error.response?.data?.message || 'An unexpected error occured . please try again';
    toast.error(errorMessage)
}
export default errorHandler;