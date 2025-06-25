// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: String,
    payer: {
      name: String,
      email: String,
      paypalId: String,
    },
    paymentId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
