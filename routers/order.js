const express = require("express");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .populate("orderItems")
      .sort({ dateOrdered: -1 });
    if (!orderList) {
      res.status(404).json({ success: false });
    }
    res.status(200).send(orderList);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", ["name", "city"])
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: {
            path: "category",
            select: "name icon",
          },
        },
      });
    if (!order) {
      res.status(404).json({ success: false });
    }
    res.status(200).send(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

router.post("/", async (req, res) => {
  try {
    const orderItemIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        const orderItemDB = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        const orderItemCreated = await orderItemDB.save();
        console.log(orderItemCreated);
        return orderItemCreated._id;
      })
    );
    const orderIdsResolved = await orderItemIds;
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const order = new Order({
      orderItems: orderIdsResolved,
      user: req.body.user,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      country: req.body.country,
      zip: req.body.zip,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      date: req.body.date,
    });
    const orderCreated = await order.save();
    if (!orderCreated) {
      return res.status(500).json({ message: "Error creating order" });
    }
    res.status(201).send(orderCreated);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const orderUpdated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!orderUpdated) {
      return res
        .status(400)
        .json({ message: "Could not find the order id to update" });
    }
    res.status(201).send(orderUpdated);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const orderDeleted = await Order.findByIdAndDelete(req.params.id);
    if (!orderDeleted) {
      return res
        .status(400)
        .json({ message: "Could not find the order id to delete" });
    }
    orderDeleted["orderItems"].forEach(async (element) => {
      console.log(element);
      const orderItemDeleted = await OrderItem.findByIdAndDelete(element);
      if (!orderItemDeleted) {
        return res.status(500).json({ message: "Error deleting order item" });
      }
    });
    res.status(200).send("Order deleted succesfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
