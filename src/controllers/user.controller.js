import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { upLoadOnClouninary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const registerUser = asyncHandler( async (req, res) => {
    // const registerUser = asyncHandler( async (req, res) => {
    //     res.status(200).json({
    //         message: "ok",
    //     }) 
    // })
    
    // get user details fromend
     // validation - not empty
     // check if user already exists: usrname, email
     // check for images, check for avatar*
     // upload them to cloudinary, avatar *
     // create user object - create entry in db
     // remove password and refresh token field from response
     // check for user creation
     // return response

     //data coming from  body or json format, or form
     const {fullName, email, username, password } = req.body

     //console.log(req.body);

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existUser) {
        throw new ApiError(409, "User Name already exists.");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath =  req?.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required.");
    }
     // upload to cloudinary

     const avatarUrl = await upLoadOnClouninary(avatarLocalPath);
     const coverImageUrl = await upLoadOnClouninary(coverImageLocalPath);

     if(!avatarUrl) {
        throw new ApiError(400, "Avatar File is Required.");
     }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        avatar: avatarUrl.url,
        coverImage: coverImageUrl?.url || "",
        password
     })

     const createUser = await User.findById(user._id).select(
        "-password -refreshTokens",
     );

     if(!createUser) {
        throw new ApiError(500, "Something went wrong while registering the user.");
     }

     return res.status(201).json(
        new ApiResponce(200, createUser, "User Register Successfully"));
})

export { registerUser } 