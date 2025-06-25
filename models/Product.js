// models/Product.js
import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema({
  length: {
    type: Number,
    required: true,
    min: 0
  },
  width: {
    type: Number,
    required: true,
    min: 0
  },
  thickness: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['mm', 'cm', 'inch'],
    default: 'mm'
  }
}, { _id: false });

const colorVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hexCode: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  opacity: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  finish: {
    type: String,
    enum: ['glossy', 'matte', 'frosted', 'textured', 'iridescent'],
    default: 'glossy'
  }
}, { _id: false });

const priceSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  pricePerUnit: {
    type: String,
    enum: ['sqft', 'sqm', 'piece', 'sheet'],
    default: 'sqft'
  },
  wholesalePrice: {
    type: Number,
    min: 0
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
    min: 1
  }
}, { _id: false });

const technicalSpecsSchema = new mongoose.Schema({
  material: {
    type: String,
    enum: ['glass', 'ceramic', 'stone', 'metal', 'mixed'],
    default: 'glass'
  },
  waterAbsorption: {
    type: Number,
    min: 0,
    max: 100
  },
  slipResistance: {
    type: String,
    enum: ['R9', 'R10', 'R11', 'R12', 'R13']
  },
  frostResistance: {
    type: Boolean,
    default: false
  },
  heatResistance: {
    type: Number, // in Celsius
    min: -50,
    max: 500
  },
  chemicalResistance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  installation: {
    adhesive: {
      type: String,
      enum: ['standard', 'epoxy', 'cement-based', 'polyurethane']
    },
    grout: {
      type: String,
      enum: ['sanded', 'unsanded', 'epoxy', 'urethane']
    },
    substrate: [String] // e.g., ['drywall', 'concrete', 'wood', 'metal']
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens']
  },
  
  description: {
    short: {
      type: String,
      required: true,
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    detailed: {
      type: String,
      maxlength: [2000, 'Detailed description cannot exceed 2000 characters']
    }
  },
  
  category: {
    primary: {
      type: String,
      required: true,
      enum: ['wall-tiles', 'floor-tiles', 'decorative-tiles', 'pool-tiles', 'backsplash', 'borders', 'medallions', 'custom']
    },
    secondary: {
      type: String,
      enum: ['bathroom', 'kitchen', 'living-room', 'outdoor', 'commercial', 'residential']
    },
    style: {
      type: String,
      enum: ['modern', 'traditional', 'contemporary', 'rustic', 'industrial', 'art-deco', 'mediterranean']
    }
  },
  
  mosaicType: {
    type: String,
    required: true,
    enum: ['sheet-mounted', 'individual-tiles', 'mesh-backed', 'paper-faced', 'dot-mounted']
  },
  
  pattern: {
    type: String,
    enum: ['square', 'hexagon', 'subway', 'herringbone', 'basketweave', 'random', 'linear', 'brick', 'custom']
  },
  
  dimensions: {
    individual: dimensionSchema,
    sheet: dimensionSchema,
    coverage: {
      type: Number, // square feet per sheet
      min: 0
    }
  },
  
  colorVariants: [colorVariantSchema],
  
  images: {
    primary: {
      type: String,
      required: [true, 'Primary image is required']
    },
    gallery: [String],
    technical: [String], // installation guides, spec sheets
    roomScenes: [String] // lifestyle images
  },
  
  pricing: priceSchema,
  
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued', 'pre-order'],
      default: 'in-stock'
    },
    location: {
      warehouse: String,
      aisle: String,
      shelf: String
    }
  },
  
  technicalSpecs: technicalSpecsSchema,
  
  applications: {
    suitable: [{
      type: String,
      enum: ['wall', 'floor', 'ceiling', 'backsplash', 'shower', 'pool', 'spa', 'fireplace', 'outdoor']
    }],
    notSuitable: [{
      type: String,
      enum: ['wall', 'floor', 'ceiling', 'backsplash', 'shower', 'pool', 'spa', 'fireplace', 'outdoor', 'heavy-traffic']
    }]
  },
  
  certifications: [{
    name: String,
    authority: String,
    certificateNumber: String,
    validUntil: Date
  }],
  
  supplier: {
    name: {
      type: String,
      required: true
    },
    contactInfo: {
      email: String,
      phone: String
    },
    leadTime: {
      type: Number, // in days
      default: 14
    }
  },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      lowercase: true
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  tags: [String],
  
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  reviews: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  salesData: {
    totalSold: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSoldDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// productSchema.index({ sku: 1 });
productSchema.index({ 'category.primary': 1, 'category.secondary': 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ 'inventory.status': 1 });
// productSchema.index({ 'seo.slug': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for calculating price per square foot
productSchema.virtual('pricePerSqFt').get(function() {
  const pricePerUnit = this?.pricing?.pricePerUnit;
  const basePrice = this?.pricing?.basePrice;

  if (!pricePerUnit || basePrice == null) return null;

  if (pricePerUnit === 'sqft') {
    return basePrice;
  } else if (pricePerUnit === 'sqm') {
    return basePrice * 0.092903;
  } else if (pricePerUnit === 'sheet' && this.dimensions?.sheet?.coverage) {
    return basePrice / this.dimensions.sheet.coverage;
  }

  return null;
});

// Virtual for inventory status
productSchema.virtual('inventoryStatus').get(function() {
  if (this.inventory.quantity === 0) {
    return 'out-of-stock';
  } else if (this.inventory.quantity <= this.inventory.lowStockThreshold) {
    return 'low-stock';
  }
  return 'in-stock';
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-save middleware to update inventory status
productSchema.pre('save', function(next) {
  this.inventory.status = this.inventoryStatus;
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category, subcategory = null) {
  const query = { 'category.primary': category, isActive: true };
  if (subcategory) {
    query['category.secondary'] = subcategory;
  }
  return this.find(query);
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true });
};

// Static method to find products in stock
productSchema.statics.findInStock = function() {
  return this.find({ 
    'inventory.status': { $in: ['in-stock', 'low-stock'] },
    isActive: true 
  });
};

// Instance method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.isActive && this.inventory.quantity > 0;
};

// Instance method to reduce inventory
productSchema.methods.reduceInventory = function(quantity) {
  if (this.inventory.quantity >= quantity) {
    this.inventory.quantity -= quantity;
    this.salesData.totalSold += quantity;
    this.salesData.lastSoldDate = new Date();
    return this.save();
  } else {
    throw new Error('Insufficient inventory');
  }
};

export default mongoose.model('Product', productSchema);