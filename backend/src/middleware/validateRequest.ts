import { NextFunction , Request , Response } from "express-serve-static-core";
import { AnySchema } from "yup";
import { HttpStatus } from "../utils/httpStatus";



export const validateRequest = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err: any) {
        const validationErrors = err.inner.map((error: any) => ({
            field: error.path,
            message: error.message,
        }));
        
        res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "Validation failed",
            errors: validationErrors,
        });
    }
};
