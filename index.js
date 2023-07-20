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
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(5050, () => console.log("Server Started"));