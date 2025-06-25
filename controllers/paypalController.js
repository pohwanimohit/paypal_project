// controllers/paypalController.js
import Order from "../models/Order.js";
import { client } from "../services/paypalService.js";
import Product from "../models/Product.js";
import paypal from "@paypal/checkout-server-sdk";

export async function createOrder(req, res) {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: productId,
        amount: {
          currency_code: "USD",
          value: product.price.toFixed(2),
        },
        description: product.name,
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.json({ orderID: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function captureOrder(req, res) {
  const { orderID } = req.body;
  const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
  captureRequest.requestBody({});

  try {
    const capture = await client.execute(captureRequest);
    const details = capture.result;
    const purchasedUnit = details.purchase_units[0];

    // Save the order in MongoDB
    const order = new Order({
      product: purchasedUnit.reference_id,
      amount: purchasedUnit.payments.captures[0].amount.value,
      status: details.status,
      payer: {
        name: details.payer.name.given_name,
        email: details.payer.email_address,
        paypalId: details.payer.payer_id,
      },
      paymentId: details.id,
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
