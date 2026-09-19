import { loginUser } from "../services/auth.service.js";

export const login = async (req,res) =>{
    try{
        const result = await loginUser(req.body);
        if(!result){
            return res.status(401).json(
                {
                    message: "Invalid email or password",
                }
            );
        }
        return res.status(200).json(
            {
                message: "Login successful",
                accessToken: result.accessToken,
                user : {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                }
            }
        );
    } catch(error){
        console.error(error.message);
        return res.status(500).json(
            {
                message: "Internal server error"
            }
        );
    }
}