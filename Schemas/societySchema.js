import mongoose from "mongoose"

const societySchema = mongoose.Schema({
    name: String,
    faculty: String,
    head: String,
    img_location: String,
    type: String
})

const Society = mongoose.model("Society", societySchema)

export default Society