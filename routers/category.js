const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  let categoryList = await Category.find();
  if (!categoryList) {
    res.status(404).json({ success: false });
  }
  res.send(categoryList);
});

router.get("/:id", async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        err: "Category not found",
      });
    }
    res.status(200).json({
      success: true,
      category: category,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      err: err,
    });
  }
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
  });
  const savedCategory = await category.save();
  if (!savedCategory) {
    res.status(500).send("Category could not be created");
  }
  res.send(savedCategory);
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Could not find the category" });
    }
    res.send(category);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, err: err });
  }
});

router.delete(`/:id`, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (deletedCategory) {
      return res
        .status(200)
        .send({ success: true, message: "Category deleted succesfully" });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
