import crypto from "node:crypto";

export const calculateSHA256 = (buffer) =>{
    return crypto.createHash("sha256").update(buffer).digest("hex");
}