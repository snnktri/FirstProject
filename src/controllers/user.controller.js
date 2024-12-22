import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";//generateAccessToken, generateRefreshToken
import { upLoadOnClouninary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"

const generateAcessanddRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshTokens = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }

    catch(err) {
        throw new ApiError(500, "Something went wrong while generating refresh and access Token:");
    }
}

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

const loginUser = asyncHandler( async (req, res) => {
    // req body data
    // username or email get
    // find the user (if not found return not found)
    // password check
    //access and refresh token generate and send to user
    // send cookies to user
    // successfull login

    const {email, username, password} = req.body;

    if(!(username || email)) {//make only one on project geerally(email, username)
        throw new ApiError(400, "Username or email is required.");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential.");
    }

    const {accessToken, refreshToken } = await generateAcessanddRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select(
        "-password -refreshTokens"
    );

    function removeCircularReferences(obj) {
        const seen = new Set();
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return; // Skip circular references
                }
                seen.add(value);
            }
            return value;
        }));
    }
    
    const sanitizedUser = removeCircularReferences(loggedInUser);

    console.log(sanitizedUser);

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponce(
            200,
            {
                user: sanitizedUser, accessToken, refreshToken,
            },
            "User logged in successfully."
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const inComingRefreshToken = req.cookies.refreshToken || req.boody.refreshToken;

    if(!inComingRefreshToken) {
        throw new ApiError(401, "Unauthorized request.");
    }

    try {
        const decodedToken = jwt.verify(
            inComingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
    
            const user = await User.findById(decodedToken?._id);
    
            if(!user) {
                throw new ApiError(401, "Invalid token");
            }
    
            if(inComingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refrence token is expired or used");
            }
    
            const option = {
                httpOnly: true,
                secure: true
            }
    
            const { accessToken, refreshTokenToken } = await generateAcessanddRefreshToken(user._id);
    
            return res.
            status(200).
            cookie("accessToken", accessToken, option).
            cookie("refreshToken", refreshTokenToken, option).
            json(
                new ApiResponce(200, {accessToken,
                     refreshTokenToken},
                     "Refresh token access successully.")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword;

    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponce(200, {}, "Password changed successfully."))

})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res.status(200)
    .json(new ApiResponce(200, req.user, "Current User fetched Sucessfull"))
})

const upDateAccountDetails = asyncHandler( async (req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email) {
        throw new ApiError(400, "Please enter all field.");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        ).select("-password");

        return res.status(200)
        .json(new ApiResponce(
            200,
            user,
            "Account Details Updated successfully."
        ));
})

const updateAvatar = asyncHandler( async(req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar not found.");
    }

    const avatar = await upLoadOnClouninary(avatarLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar not uploaded in cloudinary.");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true,
        }
    ).select("-password");

    return res.status(200)
    .json(
        new ApiResponce(
            200,
            user,
            "Avatar Image Uploaded"
        )
    )
})

const updateCoverImage = asyncHandler( async(req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage not found.");
    }

    const coverImage = await upLoadOnClouninary(coverImageLocalPath);

    if(!coverImage) {
        throw new ApiError(400, "Cover Image not uploaded in cloudinary.");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true,
        }
    ).select("-password");

    return res.status(200)
    .json(
        new ApiResponce(
            200,
            user,
            "Cover Image Uploaded"
        )
    )
})


export { registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     upDateAccountDetails,
     updateAvatar,
     updateCoverImage };