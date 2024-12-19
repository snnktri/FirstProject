import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema( 
    {
     name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
     },
     email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
     },
     fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
     },
     avatar: {
        type: String, //cloudnary url for avatar
        required: true,
     },
     coverImage: {
        type: String,//cloudnary
     },
     watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
     ],
     password: {
        type: String,
        required: [true, "Password is required"],
     },
     refreshTokens: {
        type: String,
     }

}, 
{timestamps:true});

userSchema.pre("save", async function (next) {
    if(!this.isModified())
        return next();
    this.password = await bcrypt.hash(this.password, 8);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRTY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET=123123
    ,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User = mongoose.model("User", userSchema);