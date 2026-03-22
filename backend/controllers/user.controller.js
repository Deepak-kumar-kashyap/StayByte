import User from "../model/user.model.js"
import jwt from "jsonwebtoken";

export const getCurrentUser = async (req, res) => {
    try {
        let { token } = req.cookies;
        
        if (!token) {
            return res.status(200).json(null);
        }

        let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!verifyToken) {
            return res.status(200).json(null);
        }

        let user = await User.findById(verifyToken.userId).select("-password").populate("listing", "title image1 image2 image3 description rent category city landMark isBooked host ratings")
        .populate("booking", "title image1 image2 image3 description rent category city landMark isBooked host ratings")
        if (!user) {
            return res.status(200).json(null);
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(200).json(null)
    }
}