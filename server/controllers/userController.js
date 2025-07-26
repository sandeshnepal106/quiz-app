import {UserModel} from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from 'crypto'
import transporter from "../config/nodemailer.js";
import { QuizModel } from "../models/quizModel.js";

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
        return res.json({success: true, id: user._id, message:"Login Successful."})
        
        
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
        })
        return res.json({success: true, message: "Logout successful."})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const editProfile = async(req, res) =>{
    const {name, username, email, password} = req.body;
    const userId = req.userId;
    if(!userId){
        return res.json({success: false, message: "User Id not provided"})
    }
    
    const hashedPassword = await bcrypt.hash(password, 10); // manually hash
    
    try {

        const updatedUserDetails = await UserModel.findOneAndUpdate({_id: userId}, {name, username, email, password:hashedPassword}, {new:true});
        if(!updatedUserDetails){
            return res.json({success: false, message: "Could not update user details."})
        }
        return res.json({success: true, message: "Successfully updated user details."})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const checkAuth = async (req, res) =>{
    try {
        const userId = req.userId;
        if(!userId) {
            return res.json({success: false, message: "User Id not found."});
        }
        return res.json({success: true, userId, message: "Logged in."});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const sendResetOtp = async (req, res) =>{
    const {email} = req.body;
    if(!email) {
        return res.json({success: false, message: "Email is required."});
    }

    try {
        const user = await UserModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "User not found."});
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15*60*1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your otp for resetting your password is ${otp}`
        }
        await transporter.sendMail(mailOption);
        return res.json({success: true, message: "OTP sent to your email."});
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const resetPassword = async (req, res) =>{
    const {email, otp, newPassword} = req.body;
    if(!email || !otp || !newPassword) {
        return res.json({success: false, message: "Email, OTP, and new password are required."});
    }

    try {
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"})
        }
        if(user.resetOtpExpireAt < Date.now()){
             return res.json({success: false, message: "OTP expired"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Password has been reset successfully'});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const getMyQuizzes = async (req, res) => {
  const userId = req.userId;

  try {
    const myQuizzes = await QuizModel.find({ createdBy: userId });

    return res.json({
      success: true,
      myQuizzes,
      message: "My quizzes fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const myDetails = async (req, res) =>{
    const userId = req.userId;
    try {
        const user = await UserModel.findOne({_id:userId});
        if(!user){
            return res.json({success: false, message: "User not found."});
        }
        return res.json({success: true, user, message: "Logged in."});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    const imageUrl = req.file.path;

    // Update user profile with image URL
    await UserModel.findByIdAndUpdate(req.userId, { profilePic: imageUrl });

    res.json({ success: true, message: 'Profile picture updated', imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
