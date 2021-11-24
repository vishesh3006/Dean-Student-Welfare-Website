import mongoose from "mongoose"

const noticeSchema = mongoose.Schema({
    name: String,
    date: Array,
    notice_location: String,
})

const Notice = mongoose.model("Notice", noticeSchema)

export default Notice