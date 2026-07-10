import mongoose from "mongoose";

const learningLogSchema = new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now(),
        required:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    topics:[{
        topicName:{
            type: String,
            required: true,
            trim: true,
            validate: {
            validator: v => v.length > 0,
            message: "Topic name cannot be empty"
        }
        },
        subtopics:[{
            type: String,
            trim: true,
            required:true
        }],
        time: {
            hour: {
                type:Number,
                min:0,
                max:24,
                default:0
            },
            minute: {
                type:Number,
                min:0,
                max:59,
                default:0
            }
        }
    }

    ],
    
    
});
const Learning_log = mongoose.model("Learning_log", learningLogSchema);
export default Learning_log;