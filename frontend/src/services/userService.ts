import axiosInstance from "../utils/axiosInstance";
import { SignupInterface, UserProfileInterface } from "../interfaces/userInterface";
import errorHandler from "../utils/errorHandler";
import axios from "axios";
import { Address } from "../interfaces/addressInterface";
import { Booking } from "../interfaces/bookingInterface";
import { Reaction } from "../components/ChatModel";



export const registerUser = async (userDetails : SignupInterface) => {
    try{
        const response = await axiosInstance.post('/auth/register', userDetails);
        console.log(response, "res")
        return response.data;
    } catch (error) {
        errorHandler(error);
        throw error;
    }
}

export const verifyOtp = async (otp:string , email:string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/auth/verify-otp', {otp , email });
        console.log('Verification Success:', response.data);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user_Id',response.data.userId)
        return response;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }
}

export const resendOtp = async (email: string) : Promise<any> => {
    try{
        const response = await axiosInstance.post('/auth/resend-otp',{email},{
            headers: {
                'Content-Type': 'application/json', 
            }
        })
        return response.data;
    }catch(error: any) {
        errorHandler(error);
        throw error;
    }

}

export const loginUser = async (credentials: { email: string; password: string }): Promise<any> => {
    try {
        console.log('Login credentials:', credentials); 
        const response = await axiosInstance.post('/auth/login', credentials, {
            headers: {
                'Content-Type': 'application/json', 
            },
        });
        console.log('Login Response:', response.data);
        const { accessToken, refreshToken,userId , userFirstName , userEmail , userRole} = response.data;

        return { accessToken, refreshToken,userId ,  userFirstName , userEmail , userRole}; 
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const sendResetLink = async (email: string): Promise<any> => {
    try {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error: any) {
        errorHandler(error);
        throw error;
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    try {
        const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
        return response.data.message;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to reset password.');
    }
};



export const getUserProfile = async () : Promise<any> => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axiosInstance.get('/auth/profile',{
            headers: {
             
                'Authorization': `Bearer ${token}`, 
            },

        }); 
        console.log("response" , response)
        return response.data 
    } catch (error:any) {
        throw new Error(error.response?.data?.message || 'Error fetching user profile');
    }
}


export const updateUserProfile = async (formData : FormData) : Promise <{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
    console.log("token", token)
try{
   const response = await axiosInstance.put('/auth/profile/edit',formData,{
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`, 
    },
   })
   return { success: true, message: 'Profile updated successfully!' };
}catch (error) {
    errorHandler(error);
    throw error;
}
}

export const fetchAddress = async (userId: string): Promise<Address> => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axiosInstance.get(`/auth/address/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Backend response:", response.data); 
      return response.data.userAddress;
    } catch (error) {
      errorHandler(error);
      throw error;  
    }
  };
  

  export const fetchWorkersByService = async (serviceName: string) => {
    const token = localStorage.getItem('accessToken'); 
    try {
      const response = await axiosInstance.get(`/auth/workers?skill=${encodeURIComponent(serviceName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("fetched workers" , response.data.workers)
      return response.data.workers; 
    } catch (error) {
      throw new Error('Failed to fetch workers');
    }
  };


  export const fetchingSlots =async (date:Date , workerId:string) => {
    const token = localStorage.getItem('accessToken');
    const formattedDate = date.toISOString().split('T')[0]; 
    try{
        const response = await axiosInstance.get(`/auth/available-slots?workerId=${workerId}&date=${formattedDate}`,{
          headers: {
            'Authorization': `Bearer ${token}`,
          }, 
        });
       
      
     console.log("fetched workers" , response)
      return response
    }catch (error) {
        throw new Error('Failed to fetch slots');
    }
  }



export const createBooking = async(bookingDetails:Booking) => {
    const token = localStorage.getItem('accessToken');

    const response = await axiosInstance.post('/auth/create-booking', bookingDetails , {
        headers: {
            'Authorization': `Bearer ${token}`,
          }, 
    });
    return response;
}
export const fetchBookigs = async (userId: string,currentPage:number , limit: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
  
    const response = await axiosInstance.get(`/auth/booking/${userId}`, {
      params: {
        page: currentPage, 
        limit,

    },
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    console.log("ppp", response)
    return response.data; 
  };

  export const fetchWorkerById = async (workerId:string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const response = await axiosInstance.get(`/auth/worker/${workerId}`,{
        headers: {
            Authorization: `Bearer ${token}`, 
          },
    })
    return response.data;
  }

  export const cancelBooking = async(bookingId:string) => {
    const token = localStorage.getItem('accessToken');
    console.log("bookid",bookingId)
    if(!token) {
      throw new Error('Authentication token is missing');
    }
    const response = await axiosInstance.post(`/auth/cancelBooking/${bookingId}`)
    return response.data;
  }

  export const fetchServices = async (page = 1, limit = 5, search = '') => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axiosInstance.get('/auth/services', {
        params: {
          page,
          limit,
          search,
        },
        headers: {
          Authorization: `Bearer ${token}`,
      },
        
      },
      );
      const { services, totalServices } = response.data;
      return { services, totalServices };
    } catch (error:any) {
      throw new Error('Failed to fetch services: ' + error.message);
    }
  };

  export const updateCoordinatesUser  = async(lat: number , lng:number, userId:string) =>{
    const token = localStorage.getItem('accessToken');
  const response = await axiosInstance.put('/auth/updateLocation',{
    
        userId,
        latitude: lat,
        longitude: lng,
    },
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
  return response;
}


export const resetPasswordFromPassword = async ( newPassword: string , userId:string): Promise<string> => {
  const token = localStorage.getItem('accessToken')

  try {
      const response = await axiosInstance.post(`/auth/user/reset-password/${userId}`, { newPassword } ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.message;
  } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password.');
  }
};
    


export const createCheckoutSession = async (data:{amount:number;bookingId: string; paymentType:string , successUrl:string} ) => {
  const token = localStorage.getItem('accessToken');
  try{
    const response = await axiosInstance.post('/auth/create-checkout-session',data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    });
    return response.data;
  }catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const getBookingDetails = async (bookingId: string) => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await axiosInstance.get(`/auth/get-booking-details/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw new Error('Failed to fetch booking details. Please try again.');
  }
};


export const updateBookingStatus = async (bookingId: string, status: string) => {
  const token = localStorage.getItem('accessToken');
  try {
    const res = await axiosInstance.post(
      `/auth/update-paymentStatus/${bookingId}`,
      {
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data; 
  } catch (error:any) {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access', error);
    } else {
      console.error('Error updating payment status', error);
    }
    throw error;
  }
};

export const fetchWorkerProfile = async(workerId:string) => {
  const token = localStorage.getItem('accessToken');
  try{
    const response = await axiosInstance.get(`/auth/worker-profile/${workerId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log("respo" , response)
    return response.data
  }catch (error) {
    console.log("error feting worker profile")
  }
}

export const fetchChat = async (userId:string , workerId:string) => {
  const token = localStorage.getItem('accessToken');
  try{
   const response = await axiosInstance.post('/auth/chat',{
    userId ,
    workerId
   })
   return response.data
  }catch (error) {
  console.log("error",error)
  }
}

export const fetchMessages= async(chatId:string) => {
  const token = localStorage.getItem('accessToken');
  try{
    const response = await axiosInstance.get(`/auth/messages/${chatId}`)
    return response.data;
  }catch (error) {
    console.log("error",error)
  }
}
interface MessageData {
chatId:string;
senderId:string;
senderModel:string
text?:string;
mediaUrl?:string

}

export const  sendingMessage = async (messageData :MessageData , mediaFile:File| null) => {
  try{

    const formData = new FormData();
    formData.append("senderId", messageData.senderId);
    formData.append("senderModel", messageData.senderModel);
    formData.append("chatId", messageData.chatId);
    if (messageData.text) {
      formData.append("text", messageData.text);
    }
    if (mediaFile) {
      formData.append("media", mediaFile);
    }
    console.log("formdata" , formData)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
  }
       const response = await axiosInstance.post('/auth/message' ,formData ,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
       })
       console.log("message send" , response)
       return response
  }catch (error) {
    console.log("error",error)
  }
}

export const sendReaction = async (messageId: string, reactionData: Reaction) => {
  const token = localStorage.getItem('accessToken');
  try {
      const response = await axiosInstance.post(
          `/auth/reaction/${messageId}`,
          { emoji: reactionData.emoji }, 
          {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' 
              }
          }
      );
      return response.data;
  } catch (error) {
      console.error("Error sending reaction:", error); 
      throw error;
  }
}

export const fetchChats = async (userId:string) => {
  const token = localStorage.getItem('accessToken');
  const response = await axiosInstance.get(`/auth/chat/${userId}`,{
    headers:{
      'Authorization': `Bearer ${token}`,
    }
  })
  console.log("responsechat" , response)
  return response.data;
}

export const fetchUnreadMessags = async (userId:string) => {
  const token = localStorage.getItem('accessToken');
   try{
      const unreadCount = await axiosInstance.get(`/auth/unread-messages/${userId}` ,{
          headers: {
              'Authorization': `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
      })
      return unreadCount.data;
   }catch (error) {

   }
  }

  export const getWorkersIds = async(userId:string) => {
    const token = localStorage.getItem('accessToken');
    try{
        const response = await axiosInstance.get(`/auth/get-workers/${userId}`,{
          headers:{
            'Authorization': `Bearer ${token}`,
          }
        })
        return response;
    }catch (error) {
       console.log(error)
    }
  }

  export const getBalanceAmount = async(bookingId:string) => {
    const token = localStorage.getItem('accessToken');
    try{
       const response = await axiosInstance.get(`/auth/balanceAmount/${bookingId}` ,{
        headers:{
          'Authorization': `Bearer ${token}`,
        }
       })
       console.log("balance" , response)
       return response;
    }catch(error) {
   console.log(error)
    }
  }


  export const getAllNotificationByUserId = async(userId:string) => {
    const token = localStorage.getItem('accessToken');
    try{
         const response = await axiosInstance.get(`/auth/get-notifications/${userId}` ,{
          headers:{
            'Authorization': `Bearer ${token}`,
          }
         })
         console.log("notification" , response)
         return response.data
    }catch (error) {

    }
  }

  export const getBooking = async (bookingId:string) => {
    const token = localStorage.getItem('accessToken');
    try{
     const response = await axiosInstance.get(`/auth/bookings/${bookingId}` , {
      headers:{
        'Authorization': `Bearer ${token}`,
      }
     })
     console.log("booking respo" , response)
     return response.data
    }catch (error) {

    }
  }
 
