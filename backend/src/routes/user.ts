// import express, { Request, Response } from 'express';
// import User from '../infrastructure/database/models/userModels'; // Adjust the path as necessary
// import { check, validationResult } from 'express-validator';
// import jwt from 'jsonwebtoken'


// const router = express.Router();

// router.post('/register', [
//     check('firstName', 'First name is required').notEmpty(),
//     check('lastName', 'Last name is required').notEmpty(),
//     check('email', 'Email is required').isEmail(),
//     check('password', 'Password with 6 or more characters is required').isLength({ min: 6 }),
// ], async (req: Request, res: Response): Promise<void> => {  
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         res.status(400).json({ errors: errors.array() });
       
//     }else{
//         try{
//          let user = await User.findOne({
//             email: req.body.email
//          })
//          if(user) {
//             res.status(400).json({message: "user already exist"});
//          }else{
//             user = new User (req.body);
//             await user.save();
//             const token = jwt.sign(
//                 {userId: user._id},
//                 process.env.JWT_SECRET_KEY as string,
//                 {expiresIn: "1d"}
//             );
//             res.cookie('auth_token', token , {
//                 httpOnly:true,
//                 maxAge:86400000,
//             });
//             res.status(200).send({message: "User registerd OK"})
//          }
//         }catch (error) {
//             console.error(error);
//             res.status(500).send({ message: "Something went wrong" });
//         }
//     }

// });

// export default router;
