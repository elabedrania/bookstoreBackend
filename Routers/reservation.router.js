const express = require("express");
const reservation = require("../Models/reservation");
const book = require("../Models/book");
const user = require("../Models/user");
const mongoose = require("mongoose");
const route = express.Router();

 // Create a new order
route.post("/", async (req, res) => {
    const {
      userId,
      items,
      subtotal,
      total,
      fullName,
      phoneNumber,
    } = req.body;

    try {
      let user = null;

      // Verify if a valid userId is provided
      if (userId !== "") {
        // If userId is not an empty string, verify the user
        user = await User.findById(userId);
        if (!user) {
          return res.status(400).json({ error: "Invalid user ID" });
        }
      }

      // Create a new order
      const newOrder = await Order.create({
        userId: user ? userId : null, // Set userId or null based on the condition
        items,
        subtotal,
        total,
        tax,
        shipping,
        fullName,
        phoneNumber,
        
      });

      // Add the order details to the user's orders list if a valid user is provided
      if (user) {
        user.orders.push(newOrder);
        await user.save();
      }

      // Update book stock after the order is created
      for (const item of items) {
        
        const book = await book.findById(item.id);

        if (!book) {
          return res
            .status(400)
            .json({ error: `book with ID ${item.id} not found` });
        }

        // Check if there is enough stock
        if (book.stock < item.quantity) {
          return res
            .status(400)
            .json({ error: `Insufficient stock for book ${book.title}` });
        }

        // Deduct stock
        book.stock -= item.quantity;
        await book.save();
      }

      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error creating an order:", error);
      res
        .status(500)
        .json({ error: "Failed to create the order", details: error.message });
    }
  });

  // Get all order details for a user
  route.get("/user/:userId/orders", async (req, res) => {
    const { userId } = req.params;

    try {
      // Verify if the provided userId is a valid user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Retrieve all orders for the user
      const orders = await Order.find({ userId });

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch user orders", details: error.message });
    }
  });

  // Get all orders
  route.get("/", async (req, res) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get an order by ID
  route.get("/:orderId", async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch the order" });
    }
  });

  // New route to generate and send PDF factura
  route.get("/:orderId/generate-pdf", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId).populate({
        path: "items.id",
        model: "book",
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const doc = new PDFDocument();
      res.setHeader(
        "Content-disposition",
        `attachment; filename=factura-${orderId}.pdf`
      );
      res.setHeader("Content-type", "application/pdf");

      doc.pipe(res);

      // Header
      doc
        .fontSize(30)
        .fillColor("#333333")
        .text("Factura", { align: "center" });
      doc.moveDown();

      // Order Information
      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Order ID: ${order._id}`, { align: "left" });
      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Customer: ${order.fullName}`, { align: "left" });
      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Date: ${order.createdDate || "N/A"}`, {
          align: "left",
        });
      doc.moveDown(2);

      // Items
      doc.fontSize(16).fillColor("#333333").text("Items:", { align: "left" });
      order.items.forEach((item, index) => {
        const book = item.id;
        doc
          .fontSize(12)
          .fillColor("#555555")
          .text(
            `${book.title} (x${item.quantity}) - TND ${(
              item.quantity * book.salePrice
            ).toFixed(2)}`,
            { align: "left" }
          );
      });
      doc.moveDown(2);

      // Order Summary
      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Subtotal: TND ${order.subtotal.toFixed(2)}`, {
          align: "right",
        });
      doc
        .fontSize(14)
        .fillColor("#555555")
        .text(`Tax: TND ${order.tax.toFixed(2)}`, {
          align: "right",
        });
      doc
        .fontSize(16)
        .fillColor("#333333")
        .text(`Total: TND ${order.total.toFixed(2)}`, {
          align: "right",
        });

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res
        .status(500)
        .json({ error: "Failed to generate PDF", details: error.message });
    }
  });

  // Update an order
  route.put("/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Rollback stock changes (in case of an error during the update)
      await Promise.all(
        order.items.map(async (item) => {
          const book = await book.findById(item.id);

          if (book) {
            book.stock += item.quantity;
            await book.save();
          }
        })
      );

      // Update the order
      const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {
        new: true,
      });

      // Update book stock based on the updated order
      await Promise.all(
        updatedOrder.items.map(async (item) => {
          const book = await book.findById(item.id);

          if (!book) {
            throw new Error(`book with id ${item.id} not found`);
          }

          // Check if there is enough stock
          if (book.stock < item.quantity) {
            throw new Error(`Insufficient stock for book ${book.title}`);
          }

          // Deduct stock
          book.stock -= item.quantity;
          await book.save();
        })
      );

      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error("Error updating an order:", err);
      res
        .status(500)
        .json({ error: "Failed to update the order", details: err.message });
    }
  });

  // Delete an order
  route.delete("/deleteOneOrder/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Rollback stock changes
      await Promise.all(
        order.items.map(async (item) => {
          const book = await book.findById(item.id);

          if (book) {
            book.stock += item.quantity;
            await book.save();
          }
        })
      );

      // Delete the order
      await order.delete();

      res.status(204).send();
    } catch (err) {
      console.error("Error deleting an order:", err);
      res
        .status(500)
        .json({ error: "Failed to delete the order", details: err.message });
    }
  });

  // Route to delete all orders
  route.delete("/deleteAllOrders", async (req, res) => {
    try {
      // Delete all orders
      const result = await Order.deleteMany({});

      // Remove references to orders in the users' orders arrays
      await User.updateMany({}, { $set: { orders: [] } });

      return res.status(200).json({
        message: "All orders deleted successfully",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error deleting all orders:", error);
      return res
        .status(500)
        .json({ error: "Failed to delete all orders", details: error.message });
    }
  });

