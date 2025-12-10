const mongoose = require('mongoose');
require('dotenv').config();
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const { Product } = require('../src/modules/product/product.model');
const { Category } = require('../src/modules/category/category.model');

/**
 * Generate fake products for testing
 */
const generateFakeProducts = async (count = 50) => {
  try {
    console.log('🚀 Starting product seeding...\n');

    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-ecommerce';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database\n');

    // Get all active categories
    const categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      console.error('❌ No active categories found. Please create categories first.');
      await mongoose.connection.close();
      process.exit(1);
    }
    console.log(`📁 Found ${categories.length} active categories\n`);

    // Handle reset flag - delete all existing products
    const shouldReset = process.argv.includes('--reset');
    if (shouldReset) {
      console.log('🗑️  --reset flag detected. Deleting all existing products...\n');
      const deleteResult = await Product.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} existing products\n`);
    }

    // Get all available images from uploads/images folder
    const imagesDir = path.join(__dirname, '../uploads/images');
    let availableImages = [];
    
    try {
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        // Filter only image files
        availableImages = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });
        console.log(`🖼️  Found ${availableImages.length} images in uploads/images folder\n`);
      } else {
        console.log('⚠️  uploads/images folder not found, using placeholder URLs\n');
      }
    } catch (error) {
      console.log(`⚠️  Error reading images folder: ${error.message}, using placeholder URLs\n`);
    }

    // Base URL for images
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const getRandomImage = () => {
      if (availableImages.length > 0) {
        const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        return `${baseUrl}/uploads/images/${randomImage}`;
      }
      // Fallback placeholder
      return `${baseUrl}/uploads/images/image-placeholder.jpg`;
    };

    // Product data templates - Professional Product Names
    const productTitles = [
      // Tops & Shirts
      'Classic Cotton T-Shirt',
      'Premium Denim Jeans',
      'Elegant Summer Dress',
      'Sporty Running Shoes',
      'Leather Jacket',
      'Casual Sneakers',
      'Formal Shirt',
      'Winter Coat',
      'Designer Handbag',
      'Silk Scarf',
      'Wool Sweater',
      'Linen Pants',
      'Cotton Shorts',
      'Hooded Sweatshirt',
      'Knit Cardigan',
      'Pleated Skirt',
      'Chino Pants',
      'Blazer Jacket',
      'Tank Top',
      'Maxi Dress',
      'Cargo Pants',
      'Bomber Jacket',
      'Polo Shirt',
      'Jogger Pants',
      'Windbreaker',
      'Trench Coat',
      'Blouse',
      'Leggings',
      'Crop Top',
      'Midi Dress',
      // Professional & Premium Items
      'Executive Business Suit',
      'Italian Leather Dress Shoes',
      'Cashmere Overcoat',
      'Designer Silk Blouse',
      'Tailored Wool Blazer',
      'Premium Oxford Shirt',
      'Luxury Cashmere Scarf',
      'Handcrafted Leather Belt',
      'Artisan Denim Jacket',
      'Boutique Evening Gown',
      'Classic A-Line Skirt',
      'Professional Trousers',
      'Designer Tote Bag',
      'Premium Watch Strap',
      'Luxury Sunglasses',
      'Handmade Leather Boots',
      'Silk Evening Dress',
      'Wool Blend Coat',
      'Designer Crossbody Bag',
      'Premium Cotton Polo',
      'Italian Leather Loafers',
      'Cashmere Wrap Cardigan',
      'Tailored Dress Pants',
      'Designer Clutch Purse',
      'Luxury Wool Scarf',
      'Premium Denim Shirt',
      'Handcrafted Leather Wallet',
      'Boutique Maxi Skirt',
      'Classic Pea Coat',
      'Designer Backpack',
      'Silk Chiffon Blouse',
      'Premium Leather Gloves',
      'Wool Blend Sweater',
      'Designer Ankle Boots',
      'Luxury Silk Tie',
      'Tailored Waistcoat',
      'Premium Cotton Hoodie',
      'Italian Leather Handbag',
      'Cashmere Beanie',
      'Designer Jumpsuit',
      'Classic Trench Coat',
      'Luxury Leather Jacket',
      'Premium Denim Overalls',
      'Silk Satin Dress',
      'Wool Blend Cardigan',
      'Designer Midi Skirt',
      'Handcrafted Leather Sandals',
      'Boutique Wrap Dress',
      'Premium Cotton Tunic',
      'Italian Leather Messenger Bag',
    ];

    const brands = [
      'FashionHub',
      'StyleCo',
      'TrendyWear',
      'EliteFashion',
      'ModernStyle',
      'ClassicWear',
      'UrbanChic',
      'PremiumBrand',
      'DesignerLabel',
      'FashionForward',
      'Luxury Couture',
      'Premium Essentials',
      'Artisan Collection',
      'Boutique Fashion',
      'Elite Apparel',
      'Signature Style',
      'Crafted Luxury',
      'Designer Studio',
      'Premium Fashion House',
      'Luxury Brands',
      'High-End Fashion',
      'Exclusive Collection',
      'Boutique Brands',
      'Designer Essentials',
      'Premium Lifestyle',
    ];

    const colors = [
      { name: 'Black', hexCode: '#000000' },
      { name: 'White', hexCode: '#FFFFFF' },
      { name: 'Red', hexCode: '#FF0000' },
      { name: 'Blue', hexCode: '#0000FF' },
      { name: 'Green', hexCode: '#008000' },
      { name: 'Yellow', hexCode: '#FFFF00' },
      { name: 'Pink', hexCode: '#FFC0CB' },
      { name: 'Gray', hexCode: '#808080' },
      { name: 'Brown', hexCode: '#A52A2A' },
      { name: 'Navy', hexCode: '#000080' },
      { name: 'Purple', hexCode: '#800080' },
      { name: 'Orange', hexCode: '#FFA500' },
    ];

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    const descriptions = [
      'High-quality fabric with excellent durability and comfort.',
      'Perfect for everyday wear with a modern design.',
      'Premium materials crafted for style and comfort.',
      'Trendy design that never goes out of style.',
      'Comfortable fit with attention to detail.',
      'Versatile piece that works for any occasion.',
      'Classic design with modern touches.',
      'Made with care for lasting quality.',
    ];

    const products = [];
    const existingSlugs = new Set();

    // Get existing product slugs to avoid duplicates
    const existingProducts = await Product.find({}).select('slug');
    existingProducts.forEach(p => existingSlugs.add(p.slug));

    console.log(`📦 Generating ${count} fake products...\n`);

    for (let i = 0; i < count; i++) {
      // Random category
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Random title
      const baseTitle = productTitles[Math.floor(Math.random() * productTitles.length)];
      const title = `${baseTitle} ${i + 1}`;
      
      // Generate unique slug
      let slug = slugify(title, { lower: true, strict: true });
      let slugCounter = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugify(title, { lower: true, strict: true })}-${slugCounter}`;
        slugCounter++;
      }
      existingSlugs.add(slug);

      // Random brand
      const brand = brands[Math.floor(Math.random() * brands.length)];

      // Random price range
      const basePrice = Math.floor(Math.random() * 200) + 20; // 20-220
      const salePrice = basePrice * 0.7; // 30% discount
      const hasSale = Math.random() > 0.5; // 50% chance of being on sale

      // Generate variants (1-3 variants per product)
      const variantCount = Math.floor(Math.random() * 3) + 1;
      const variants = [];
      let totalStock = 0;

      for (let v = 0; v < variantCount; v++) {
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const stockQuantity = Math.floor(Math.random() * 50) + 5; // 5-55
        totalStock += stockQuantity;

        const variantPrice = basePrice + Math.floor(Math.random() * 50) - 25; // ±25 variation
        const variantSalePrice = hasSale ? variantPrice * 0.7 : null;

        // Generate variant images (1-2 images per variant)
        const variantImageCount = Math.floor(Math.random() * 2) + 1; // 1-2 images
        const variantImages = [];
        for (let vi = 0; vi < variantImageCount; vi++) {
          variantImages.push({
            url: getRandomImage(),
            altText: `${title} - ${color.name} - ${size} - Image ${vi + 1}`,
            isPrimary: vi === 0,
            sortOrder: vi,
          });
        }

        // Get color image URL for attribute
        const colorImageUrl = getRandomImage();

        variants.push({
          sku: `${slug}-${size.toLowerCase()}-${color.name.toLowerCase()}-${v + 1}`,
          attributes: [
            {
              name: 'Size',
              value: size,
              displayValue: size,
            },
            {
              name: 'Color',
              value: color.name,
              displayValue: color.name,
              hexCode: color.hexCode,
              image: colorImageUrl, // Add image to color attribute
            },
          ],
          currentPrice: variantSalePrice || variantPrice,
          originalPrice: hasSale ? variantPrice : null,
          costPrice: Math.floor(variantPrice * 0.5),
          stockQuantity: stockQuantity,
          lowStockThreshold: 5,
          stockStatus: stockQuantity > 5 ? 'in_stock' : 'low_stock',
          images: variantImages, // Add images array to variant
          isActive: true,
        });
      }

      // Calculate price range
      const prices = variants.map(v => v.currentPrice);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };

      // Random tags
      const tagOptions = ['new', 'sale', 'trending', 'popular', 'featured', 'bestseller'];
      const tagCount = Math.floor(Math.random() * 3) + 1;
      const tags = [];
      for (let t = 0; t < tagCount; t++) {
        const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }

      // Random featured image from existing uploads
      const featuredImage = getRandomImage();
      
      // Random gallery images (2-5 images for better product display)
      const galleryCount = Math.floor(Math.random() * 4) + 2; // 2-5 images
      const gallery = [];
      for (let g = 0; g < galleryCount; g++) {
        gallery.push({
          url: getRandomImage(),
          altText: `${title} - Gallery Image ${g + 1}`,
          isPrimary: g === 0,
          sortOrder: g,
        });
      }

      // Random flags
      const isFeatured = Math.random() > 0.7; // 30% chance
      const isBestselling = Math.random() > 0.8; // 20% chance
      const isNewArrival = Math.random() > 0.6; // 40% chance

      const product = {
        title: title,
        shortDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
        description: `${descriptions[Math.floor(Math.random() * descriptions.length)]} ${descriptions[Math.floor(Math.random() * descriptions.length)]}`,
        category: category._id,
        brand: brand,
        tags: tags,
        productType: 'variable',
        featuredImage: featuredImage,
        gallery: gallery,
        variants: variants,
        basePrice: basePrice,
        priceRange: priceRange,
        totalStock: totalStock,
        status: 'published',
        isActive: true,
        isFeatured: isFeatured,
        isBestselling: isBestselling,
        isNewArrival: isNewArrival,
        slug: slug,
        averageRating: Math.random() * 2 + 3, // 3-5 rating
        totalReviews: Math.floor(Math.random() * 50),
        totalSold: Math.floor(Math.random() * 100),
      };

      products.push(product);
    }

    // Insert products
    console.log('💾 Inserting products into database...\n');
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ Successfully created ${insertedProducts.length} products\n`);

    // Summary
    console.log('📊 Product Seeding Summary:');
    console.log('━'.repeat(50));
    console.log(`Total Products: ${insertedProducts.length}`);
    console.log(`Featured Products: ${insertedProducts.filter(p => p.isFeatured).length}`);
    console.log(`Bestselling Products: ${insertedProducts.filter(p => p.isBestselling).length}`);
    console.log(`New Arrivals: ${insertedProducts.filter(p => p.isNewArrival).length}`);
    console.log(`Total Variants: ${insertedProducts.reduce((sum, p) => sum + p.variants.length, 0)}`);
    console.log(`Total Stock: ${insertedProducts.reduce((sum, p) => sum + p.totalStock, 0)}`);

    await mongoose.connection.close();
    console.log('\n✅ Product seeding completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
let productCount = 50; // Default

if (args.includes('--count')) {
  const countIndex = args.indexOf('--count');
  const count = parseInt(args[countIndex + 1]);
  if (!isNaN(count) && count > 0) {
    productCount = count;
  }
}

// Run if called directly
if (require.main === module) {
  generateFakeProducts(productCount);
}

module.exports = { generateFakeProducts };

