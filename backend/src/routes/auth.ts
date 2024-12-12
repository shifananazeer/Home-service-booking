// import express , {Request , Response} from 'express'
// import {check , validationResult} from 'express-validator'
// import User from '../infrastructure/database/models/userModels'
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'

// const router = express.Router()

// router.post("/login",[check("email","Email is Required").isEmail(),
//     check("password","password with 6 or more character required").isLength({min:6})
// ],async(req:Request,res:Response)=>{
//     const errors=validationResult(req)
//     if(!errors.isEmpty()){
//         res.status(400).json({message:errors.array()})
//     }else{
//         const {email,password}=req.body
//         try {
//             let user=await User.findOne({email})
//             if(!user){
//                 res.status(400).json({message:"Invalid Credentials"})
//             }else{
//                 const isMatch=await bcrypt.compare(password,user.password)
//                 if(!isMatch){
//                     res.status(400).json({message:"Invalid Credentials"})
//                 }else{
//                     const token=jwt.sign({userId:user.id},process.env.JWT_SECRET_KEY as string,{expiresIn:"1d"})
//                     res.cookie("auth_token", token, {
//                         httpOnly: true,
//                         secure: process.env.NODE_ENV === "production",
//                         maxAge: 86400000, 
//                       });
//                     res.status(200).json({userId:user._id})
//                 }
//             }
//         } catch (error) {
//             res.status(500).json({message:"Something went wrong"})
//         }
//     }
// })

// export default router;