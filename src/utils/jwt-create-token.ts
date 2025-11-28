import jwt from "jsonwebtoken";
export  function jwtCreateToken(id: string) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });
    return token;
}