import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) =>{
    const {name, username, email, password} = req.body;
    if(!name || !username || !email || !password){
        return res.json({success: false, message:"Missing details."})
    }
    try {
        let existingUser = await UserModel.findOne({username});
        if(existingUser){
            return res.json({success: false, message: "Username already exists."});
        }
        existingUser = await UserModel.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "Email already exists."});
        }
        const user = new UserModel({name, username, email, password});
        await user.save();
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7h'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge: 7*60*60*1000
        })
        return res.json({success: true, message: "Registration successful."})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const login = async(req, res) =>{
    const {username, email, password} = req.body;
    if((!username && !email) || !password){
        return res.json({success: false, message: "Missing details."});
    }
    try {
        const user = await UserModel.findOne({$or: [{ username }, { email }]});
        if(!user){
            return res.json({success: false, message: "User does not exist."});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: "Incorrect credentials."});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7h'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge: 7*60*60*1000
        })
        return res.json({success: true, message:"Login Successful."})
        
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const logout = async(req, res) =>{
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge: 7*60*60*1000
        })
        return res.json({success: true, message: "Logout successful."})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}