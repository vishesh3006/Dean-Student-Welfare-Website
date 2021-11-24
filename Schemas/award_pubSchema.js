import mongoose from "mongoose"

const award_pubSchema = mongoose.Schema({
    name: String,
    roll: String,
    type: String,
    place: String,
    event_name: String,
    description: String
})

const Award_Pub = mongoose.model("Award_Pub", award_pubSchema)

export default Award_Pub