import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all products with filtering, sorting, and pagination
export const getProducts = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      category,
      subcategory,
      style,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query object
    const query = { isActive: true };

    if (category) query['category.primary'] = category;
    if (subcategory) query['category.secondary'] = subcategory;
    if (style) query['category.style'] = style;
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (inStock === 'true') {
      query['inventory.status'] = { $in: ['in-stock', 'low-stock'] };
    }
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'description.short': { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['pricing.basePrice'] = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'popularity') {
      sortOptions['salesData.totalSold'] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedProducts', 'name images.primary pricing.basePrice')
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product by ID or slug
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    // Check if id is a valid MongoDB ObjectId
    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id)
        .populate('relatedProducts', 'name images.primary pricing.basePrice sku')
        .lean();
    } else {
      // Assume it's a slug
      product = await Product.findOne({ 'seo.slug': id, isActive: true })
        .populate('relatedProducts', 'name images.primary pricing.basePrice sku')
        .lean();
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Update inventory
export const updateInventory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity, operation } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    switch (operation) {
      case 'set':
        product.inventory.quantity = quantity;
        break;
      case 'add':
        product.inventory.quantity += quantity;
        break;
      case 'subtract':
        if (product.inventory.quantity >= quantity) {
          product.inventory.quantity -= quantity;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Insufficient inventory'
          });
        }
        break;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        productId: product._id,
        newQuantity: product.inventory.quantity,
        status: product.inventory.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findFeatured()
      .limit(8)
      .select('name images.primary pricing.basePrice sku category')
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const products = await Product.findByCategory(category, subcategory)
      .select('name images.primary pricing.basePrice sku')
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};