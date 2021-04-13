const { Product } = require("../models/product");
const { Category } = require("../models/category");
//const Product = require("../models/product");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { response } = require("express");
const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let err = null;
    if (!isValid) {
      err = new Error("Invalid file type");
    }
    cb(err, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(" ", "-");
    cb(null, `${fileName}-${Date.now()}.${FILE_TYPE_MAP[file.mimetype]}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  let productList = await Product.find(filter).populate("Category");
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.status(200).json(productList);
});

router.get("/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    return res.status(500).json({ success: false });
  }
  res.send({ productCount: productCount });
});

router.get("/featured", async (req, res) => {
  const productList = await Product.find({ isFeatured: true });
  if (!productList) {
    return res.status(500).json({ success: false });
  }
  res.send({ productList: productList });
});

router.get("/featured/:count", async (req, res) => {
  let count = req.params.count ? req.params.count : 0;
  const productList = await Product.find({ isFeatured: true }).limit(
    Number(count)
  );
  if (!productList) {
    return res.status(500).json({ success: false });
  }
  res.send({ productList: productList });
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product id");
  }
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res
      .status(500)
      .json({ success: false, message: "Product not found" });
  }

  await product.populate("category").execPopulate();

  res.status(200).json(product);
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid category id");
    }
    if (!req.file) {
      return res.status(400).send("No image");
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescripption: req.body.richDescripption,
      image: `${basePath}${fileName}`,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    });

    let createdProduct = await product.save();
    if (!createdProduct) {
      res.status(500).send("Could not create the product");
    }
    res.send(createdProduct);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return response.status(400).send("Invalid Product id");
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid category id");
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescripption: req.body.richDescripption,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
    if (!updatedProduct) {
      res.status(404).send("Could not find the category");
    }
    res.send(updatedProduct);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 5),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return response.status(400).send("Invalid Product id");
      }
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      let imgPaths = [];
      if (req.files) {
        imgPaths = req.files.map((file) => {
          const fileName = file.filename;
          return `${basePath}${fileName}`;
        });
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imgPaths,
        },
        { new: true }
      );
      if (!updatedProduct) {
        res.status(404).send("Could not find the category");
      }
      console.log(updatedProduct);
      res.send(updatedProduct);
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

router.delete(`/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return response.status(400).send("Invalid Product id");
    }
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (deletedProduct) {
      return res
        .status(200)
        .send({ success: true, message: "Product deleted succesfully" });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
