import mongoose from "mongoose"

const eventSchema = mongoose.Schema({
    name: String,
    date: Array,
    type: String,
    organiser: String,
    img_location: Array,
    description: String
})

const Event = mongoose.model("Event", eventSchema)

export default Event;