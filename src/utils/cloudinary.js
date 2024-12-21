import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';
// import { errorMonitor } from 'stream';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECTET // Click 'View API Keys' above to copy your API secret
});

const upLoadOnClouninary = async (localFilePath) => {
    try {
        if(!localFilePath) return;
        //upload file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, 
            {
              resource_type: "auto"
            }
        )
        //file hasbeen uploaded successfully

        // console.log("File is uploaded on cloudinary: " + response.url);
        fs.unlinkSync(localFilePath)
        return response;

    }
    catch(error) {
        fs.unlinkSync(localFilePath); //remove the
        //  locally saved temporay file as the upload 
        // file opearation
        return null;
    }
}

export { upLoadOnClouninary };
