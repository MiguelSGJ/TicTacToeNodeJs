import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true, versionKey: false})

export default mongoose.model("User", userSchema);