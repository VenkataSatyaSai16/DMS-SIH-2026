import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            role : user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h",
        }

    )
}