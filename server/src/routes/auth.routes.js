import express from "express";
import { login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginUserSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/login", validate(loginUserSchema), login);
router.get("/me" , authenticate  , (req,res)=>{
    return res.status(200).json({
        message : "Authenticated",
        user : req.user
    })
})

export default router;