import mongoose from 'mongoose';

const videoSchema= new mongoose.Schema({
    videofile:{
        type:String,
        required:true,

    },
    thumbnail:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    duration:{
        type:Number,
        required:true,
    },
    isPublished:{
        type:Boolean,
        default:false,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref: "User",
    },

},{timestamps:true}
)

const Video=  mongoose.model("Video", videoSchema)

export default Video;