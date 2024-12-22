import { Request,Response } from "express";
import {loginAdmin}  from '../../application/useCases/loginAdmin'
import { AdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryIml";
import { getUsers } from '../../application/useCases/admin/getUsers'
import { getWorkers } from "../../application/useCases/admin/getWorkers";


export const adminController =  {
 adminLogin: async(req:Request , res:Response) =>{
    console.log("body",req.body)
   try{
    const {email, password} = req.body
    const token = await loginAdmin(email , password)
    res.cookie('auth_token', token,{
        httpOnly:true,
        maxAge:86400000
    })
    res.status(200).json({message:"You can login now",token})
   }catch(error:any) {
    res.status(400).json({message: error.message})
   }
 },
 getUser: async(req:Request , res:Response) => {
    try{
        const users = await getUsers(AdminRepositoryImpl)
        console.log(users);
        res.status(200).json({users})
    } catch (error: any) {
        res.status(400).json({message : error.message})
    }
 },
 getWorker: async (req:Request , res:Response) => {
    try{
        const workers = await getWorkers(AdminRepositoryImpl)
        console.log(workers);
        res.status(200).json({workers})
    }catch (error :any) {
        res.status(400).json({message:error.message})
    }
 }
} 