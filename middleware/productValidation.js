import { body, param, query } from 'express-validator';
import Product from '../models/Product.js';

// Validation for creating a new product
export const validateCreateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
    
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens')
    .custom(async (value) => {
      const existingProduct = await Product.findOne({ sku: value });
      if (existingProduct) {
        throw new Error('SKU already exists');
      }
    }),
    
  body('description.short')
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 500 })
    .withMessage('Short description cannot exceed 500 characters'),
    
  body('category.primary')
    .isIn(['wall-tiles', 'floor-tiles', 'decorative-tiles', 'pool-tiles', 'backsplash', 'borders', 'medallions', 'custom'])
    .withMessage('Invalid primary category'),
    
  body('mosaicType')
    .isIn(['sheet-mounted', 'individual-tiles', 'mesh-backed', 'paper-faced', 'dot-mounted'])
    .withMessage('Invalid mosaic type'),
    
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
    
  body('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer'),
    
  body('images.primary')
    .notEmpty()
    .withMessage('Primary image is required')
    .isURL()
    .withMessage('Primary image must be a valid URL'),
    
  body('colorVariants.*.hexCode')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color hex code must be in format #RRGGBB')
];

// Validation for updating a product
export const validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
    
  body('name')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
    
  body('sku')
    .optional()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens')
    .custom(async (value, { req }) => {
      if (value) {
        const existingProduct = await Product.findOne({ 
          sku: value, 
          _id: { $ne: req.params.id } 
        });
        if (existingProduct) {
          throw new Error('SKU already exists');
        }
      }
    }),
    
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
    
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer')
];

// Validation for getting products with filters
export const validateGetProducts = [
  query('category')
    .optional()
    .isIn(['wall-tiles', 'floor-tiles', 'decorative-tiles', 'pool-tiles', 'backsplash', 'borders', 'medallions', 'custom'])
    .withMessage('Invalid category'),
    
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
    
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
    
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean value'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'popularity'])
    .withMessage('Invalid sort field'),
    
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

// Validation for product ID parameter
export const validateProductId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Validation for updating inventory
export const validateUpdateInventory = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
    
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
    
  body('operation')
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
];