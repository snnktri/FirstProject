import { Router } from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/user.controller.js';
import { upload } from '../middelware/multer.middelware.js';
import { veriFyJWT } from "../middelware/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/logIn").post(loginUser);

//secured router

router.route("/logout").post(veriFyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken)

export default router;