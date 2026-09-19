import express from "express";
import { login, changePasswordController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginUserSchema, changePasswordSchema } from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", validate(loginUserSchema), login);

router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        message: "Authenticated",
        user: req.user
    });
});

router.post(
    "/change-password",
    authenticate,
    validate(changePasswordSchema),
    changePasswordController
);

export default router;