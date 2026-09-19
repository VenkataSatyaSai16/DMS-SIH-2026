import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken } from "../utils/jwt.js";

export const loginUser = async ({email,password}) => {
    const user = await prisma.user.findUnique({
        where: {email},
    });

    if(!user){
        return null;
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch){
        return null;
    }
    const accessToken = generateAccessToken(user);
    return {
        user , accessToken
    };
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
};