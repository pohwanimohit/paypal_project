// routes/cartRoutes.js (Updated with validation)
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  getAllCarts,
  getCartByUserId
} from '../controllers/cartController.js';
import { auth, admin } from '../middleware/auth.js';
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateGetCartByUserId
} from '../middleware/cartValidation.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/', auth, getCart);
router.post('/add', auth, validateAddToCart, addToCart);
router.put('/item/:productId', auth, validateUpdateCartItem, updateCartItem);
router.delete('/item/:productId', auth, validateRemoveFromCart, removeFromCart);
router.delete('/clear', auth, clearCart);
router.get('/summary', auth, getCartSummary);

// Admin routes (require admin role)
router.get('/all', auth, admin, getAllCarts);
router.get('/user/:userId', auth, admin, validateGetCartByUserId, getCartByUserId);

export default router;