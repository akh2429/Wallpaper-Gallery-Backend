require("dotenv").config();
require("./DB/config.js");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userData = require("./DB/userSchema.js");
const productData = require("./DB/ProductSchema.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors({ origin: '*' }));
const axios = require("axios");



//////////////////////////////////////////////////////////////////////////////////////////////SIGNUPAPI
app.post("/register", async (req, res) => {
    try {
        const { email, fullname, password, ctnumber } = req.body;
        const existingUser = await userData.findOne({ email });
        if (existingUser) {
            return res.status(409).json("Email already exists");
        }
        const user = new userData({
            email,
            fullname,
            password,
            ctnumber
        });
        if (user) {
            await user.save();
            res.status(201).json("User data saved successfully");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json("Internal server error");
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////LOGINAPI
const secretKey = "pass2429@#+-"
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userData.findOne({ email });
        if (user) {
            if (user.password === password) {
                const payLoad = { userId: user._id, name: user.fullname };
                const token = jwt.sign(payLoad, secretKey, { expiresIn: "1h" });
                return res.status(201).json({ token: token });
            } else {
                return res.status(409).json("Incorrect Password");
            }
        } else {
            return res.status(409).json("User not Found");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});



/////////////////////////////////////////////////////////////////////////////////////////////////////ProductAPI

app.get("/images", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const totalRecords = await productData.countDocuments();
        const totalPages = Math.ceil(totalRecords / pageSize);
        if (page < 0) {
            return res.status(409).json("Page Value can't be Less than 1");
        }
        if (page > totalPages) {
            return res.status(409).json("No More Images Found");
        }
        const products = await productData.find()
            .skip(skip)
            .limit(pageSize)
            .lean();
        res.json({
            currentPage: page,
            totalPages: totalPages,
            products: products,
        });
    } catch (error) {
        console.error(+error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////favouriteFunctionality
app.post("/favourite", async (req, res) => {
    const { action, userId, prodId } = req.body;
    try {
        const user = await userData.findById(userId);
        if (user) {
            const check = user.favourites.find(val => val.imgId.toString() === prodId);
            if (!check && action === "setLike") {
                user.favourites.push({ imgId: prodId });
                await user.save();
                return res.status(201).json("Image added to your favourites");
            } else if (check && action === "setDelete") {
                const checkIndex = user.favourites.findIndex(val => val.imgId.toString() === prodId);
                if (checkIndex >= 0) {
                    user.favourites.splice(checkIndex, 1)
                    await user.save()
                    return res.status(201).json(" Shot Removed from favourites ");
                }
            } else {
                return res.status(409).json("Image is already in your favourites");
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: `${error}` });
    }
})

//////////////////////////////////////////////////////////////////////////////////////////////////favouritesData

app.post("/favouriteData", async (req, res) => {
    const { userId } = req.body;
    try {
        const favourites = await userData.findById(userId).populate("favourites.imgId");
        return res.status(201).json(favourites);
    }
    catch (error) {
        res.status(500).json({ error: `${error}` });
    }
})


app.listen(5050, () => console.log("Server Started"));
