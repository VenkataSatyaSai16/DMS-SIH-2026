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