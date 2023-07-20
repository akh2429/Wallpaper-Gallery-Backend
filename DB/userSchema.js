const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: { type: String, required: true },
    password: {
        type: String,
        required: true,
    },
    ctnumber: {
        type: Number,
        required: true,
    },
    favourites: [
        {
            imgId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "gallerydata",
                unique: false,
            }
        }
    ]
});
module.exports = mongoose.model("userdatas", userSchema);