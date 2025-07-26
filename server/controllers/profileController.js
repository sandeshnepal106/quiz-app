import {UserModel} from "../models/userModel.js";
import {QuizModel} from "../models/quizModel.js";

export const getProfile = async (req, res) => {
    const { profileId } = req.params;

    try {
        const profile = await UserModel.findById(profileId).select('-password');
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile does not exist." });
        }

        const profileQuizzes = await QuizModel.find({ createdBy: profileId });

        return res.status(200).json({
            success: true,
            name: profile.name,
            username: profile.username,
            profilePic: profile.profilePic,
            email: profile.email,
            profileQuizzes,
            message: "Profile details fetched successfully."
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
