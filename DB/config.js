const mongoose = require("mongoose");
const db = process.env.MONGODB_URL;
mongoose.connect(db).then(() => {
    console.log("Connection Successful");
}).catch((error) => {
    console.error("Connection Error:", error);
});