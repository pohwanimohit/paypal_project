import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getFeaturedProducts,
  getProductsByCategory
} from '../controllers/productController.js';
import { auth, admin } from '../middleware/auth.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProducts,
  validateProductId,
  validateUpdateInventory
} from '../middleware/productValidation.js';

const router = express.Router();

// Public routes
router.get('/', validateGetProducts, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category/:subcategory', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes (require authentication + admin role)
router.post('/', auth, admin, validateCreateProduct, createProduct);
router.put('/:id', auth, admin, validateUpdateProduct, updateProduct);
router.delete('/:id', auth, admin, validateProductId, deleteProduct);
router.patch('/:id/inventory', auth, admin, validateUpdateInventory, updateInventory);

export default router;