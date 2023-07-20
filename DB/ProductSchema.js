const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    author: {
        type: String,
    },
    width: {
        type: Number
    },
    height: {
        type: Number,
    },
    url: {
        type: String
    },
    download_url: {
        type: String
    }
});
module.exports = mongoose.model("gallerydatas", productSchema);