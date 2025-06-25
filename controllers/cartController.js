// controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id, isActive: true })
      .populate('items.product', 'name price image category stock');
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId, isActive: true });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add more items than available stock'
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].totalPrice = product.pricing["basePrice"] * newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.pricing["basePrice"],
        totalPrice: product.pricing["basePrice"] * quantity
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price image category stock');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Validate stock
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].pricing.basePrice * quantity;

    await cart.save();
    await cart.populate('items.product', 'name price image category stock');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price image category stock');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// Get cart summary (for navbar, etc.)
export const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id, isActive: true });
    
    const summary = {
      totalItems: cart ? cart.totalItems : 0,
      totalAmount: cart ? cart.totalAmount : 0
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart summary',
      error: error.message
    });
  }
};

// Admin: Get all carts
export const getAllCarts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const carts = await Cart.find({ isActive: true })
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    const total = await Cart.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        carts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching carts',
      error: error.message
    });
  }
};

// Admin: Get cart by user ID
export const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const cart = await Cart.findOne({ user: userId, isActive: true })
      .populate('user', 'name email')
      .populate('items.product', 'name price image category stock');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};