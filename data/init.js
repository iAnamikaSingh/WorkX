import mongoose from "mongoose";
import Learning_Log from "../models/log.js";
const DB_URL = "mongodb://127.0.0.1:27017/progress";
async function main() {
    await mongoose.connect(DB_URL);
}

// main().then(() => {
//     console.log("DB connected");
// }).catch((err) => {
//     console.log(err);
// });
const sampleData = [
    {
        date: new Date(2026, 5, 13),
        topics:[
            {
                topicName: "Development",
                subtopics:["MongoDB with Express", "Project- Log your Progress"],

            }, 
            {
                topicName:"Accountancy",
                subtopics:["Vouchers", "Journal Entries"],

            }
        ]
    }, 
    {

        date: new Date(2026, 5, 14),
        topics:[
            {
                topicName: "Development",
                subtopics:["Hillmania"],
                time:{
                    minute:30
                }

            }, 
            {
                topicName:"Accountancy",
                subtopics:["Journal Entries", "Ledger"],
                time:{
                    hour:4,
                    minute:2
                }
            }
        ]
    }, 
    
    
]
// Learning_Log.insertMany(sampleData).then(() => {
//     console.log("Inserted sample listings")
// }).catch((err) => {
//     console.log(err);
// } )
export default sampleData;