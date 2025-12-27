import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
//fs lets you: Read files, Delete files, Rename files. You’ll use it later to delete temporary files from your server.


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadOnCloudinary = async (localFilePath) =>{ //localFilePath: path of the file saved on your server (by Multer usually).
    try {
        if(!localFilePath) return null; //If no file path is provided: Don’t crash, Just return null. This prevents unnecessary errors.

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{ //pause here wait until Cloudinary finishes uploading
            resource_type: "auto"//auto: automatically detect the file type (image, video, etc.)
        })
        //file uploaded on cloudinary
        console.log("file uploaded on cloudinary", response.url);; //for testing prupose to see if upload was successful
        //fs.unlinkSync(localFilePath); //remove the file from local storage after successful upload
        return response //response contains details about the uploaded file (like URL, public_id, etc.) return it to the caller
    } catch (error) { 
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload failed
        return null;
    }
}

export {uploadOnCloudinary};

/*
This function does three critical jobs:

1️⃣ Takes a locally saved file (from Multer)
2️⃣ Uploads it to Cloudinary
3️⃣ Deletes the local copy (success OR failure)

Your server stays clean. Your media lives in the cloud

Cloudinary Utility (File Upload Helper)

What is this utility?
The Cloudinary utility is a reusable helper function that uploads files from the server to Cloudinary cloud storage and then deletes the local temporary file.
It is used when files are first stored temporarily on the backend (usually by Multer).

Why do we need a Cloudinary utility?
When a user uploads a file:
Frontend sends the file
Backend (Multer) saves it temporarily on the server
File must be moved to cloud storage
Temporary server file must be deleted
This utility automates steps 3 and 4.

What problem does it solve?
• Prevents server storage from filling up
• Centralizes upload logic in one place
• Makes file uploads reusable across projects
• Keeps controllers clean
*/