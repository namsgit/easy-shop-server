const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      res.status(404).send("No user forund");
    }
    res.send(userList);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);
  if (!userCount) {
    return res.status(500).json({ success: false });
  }
  res.send({ userCount: userCount });
});

router.get("/:id", async (req, res) => {
  try {
    const userList = await User.findById(req.params.id).select("-passwordHash");
    if (!userList) {
      res.status(404).send("No user forund");
    }
    res.send(userList);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      country: req.body.country,
    });
    const createdUser = await user.save();
    if (!createdUser) {
      res.status(500).send("Error creating entry");
    }
    res.send(createdUser);
  } catch (err) {
    console.log();
    res.status(500).send(err);
  }
});

router.post("/register", async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      country: req.body.country,
    });
    const createdUser = await user.save();
    if (!createdUser) {
      res.status(500).send("Error creating entry");
    }
    res.send(createdUser);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send("No user found with this email");
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const jwtToken = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.PASSWORD_KEY,
        {
          expiresIn: "1d",
        }
      );
      res.status(404).send({ email: user.email, token: jwtToken });
    } else {
      res.status(400).send("Invalid user/password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.delete(`/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return response.status(400).send("Invalid User id");
    }
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (deletedUser) {
      return res
        .status(200)
        .send({ success: true, message: "User deleted succesfully" });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
