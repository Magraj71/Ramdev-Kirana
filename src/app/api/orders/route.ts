import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

// Connect to MongoDB
await connectDB();

// POST - Place a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Received order data:', JSON.stringify(body, null, 2));
    
    const {
      storeId,
      customer,
      items,
      payment = { method: 'cod', status: 'pending' },
      delivery,
      notes,
      createdBy,
      subtotal,
      discountAmount = 0,
      taxAmount = 0,
      shippingCharge = 0,
      totalAmount
    } = body;

    // ✅ Validation
    if (!storeId || !customer || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customer.name || !customer.email || !customer.phone) {
      return NextResponse.json(
        { success: false, message: 'Customer information incomplete' },
        { status: 400 }
      );
    }

    // ✅ Debug: Check database products
    console.log('🔍 Checking database products...');
    const allProducts = await Product.find({ storeId });
    console.log(`📊 Found ${allProducts.length} products in store ${storeId}:`);
    allProducts.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p._id}, SKU: ${p.sku}, Stock: ${p.stock})`);
    });

    // ✅ Check product availability and update stock
    const productUpdates = [];
    const updatedItems = [];
    
    for (const item of items) {
      console.log(`\n🛒 Processing item: ${item.name}`);
      console.log(`   Cart Product ID: ${item.productId}`);
      console.log(`   Type: ${typeof item.productId}`);
      console.log(`   Quantity: ${item.quantity}`);
      
      let product;
      
      // Try 1: Find by exact _id match
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        try {
          const productId = new mongoose.Types.ObjectId(item.productId);
          product = await Product.findById(productId);
          console.log(`   ✅ Found by ID: ${product ? 'Yes' : 'No'}`);
        } catch (error) {
          console.log(`   ❌ Invalid ObjectId format: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️ Product ID is not valid ObjectId`);
      }
      
      // Try 2: Find by name and storeId (fallback)
      if (!product) {
        console.log(`   🔍 Trying to find by name: "${item.name}"`);
        product = await Product.findOne({
          name: item.name,
          storeId: storeId
        });
        console.log(`   ✅ Found by name: ${product ? 'Yes' : 'No'}`);
      }
      
      // Try 3: Find by SKU (if available)
      if (!product && item.sku) {
        console.log(`   🔍 Trying to find by SKU: "${item.sku}"`);
        product = await Product.findOne({
          sku: item.sku,
          storeId: storeId
        });
        console.log(`   ✅ Found by SKU: ${product ? 'Yes' : 'No'}`);
      }
      
      // Product not found
      if (!product) {
        console.log(`   ❌ Product not found in database`);
        return NextResponse.json(
          { 
            success: false, 
            message: `Product "${item.name}" not found in our inventory. Please refresh cart.`,
            debug: {
              searchedId: item.productId,
              productName: item.name,
              storeId: storeId
            }
          },
          { status: 404 }
        );
      }
      
      console.log(`   ✅ Found product: ${product.name} (ID: ${product._id}, Stock: ${product.stock})`);
      
      // ✅ Check store match
      if (product.storeId.toString() !== storeId) {
        console.log(`   ❌ Store mismatch: Product store ${product.storeId} vs Order store ${storeId}`);
        return NextResponse.json(
          { 
            success: false, 
            message: `Product "${item.name}" is not available in your selected store.` 
          },
          { status: 400 }
        );
      }
      
      // ✅ Check stock availability
      if (product.stock < item.quantity) {
        console.log(`   ❌ Insufficient stock: Available ${product.stock}, Requested ${item.quantity}`);
        return NextResponse.json(
          { 
            success: false, 
            message: `Only ${product.stock} units of "${item.name}" available. Please update quantity.` 
          },
          { status: 400 }
        );
      }
      
      // ✅ Update product stock
      const originalStock = product.stock;
      product.stock -= item.quantity;
      console.log(`   📉 Updating stock: ${originalStock} → ${product.stock}`);
      productUpdates.push(product.save());
      
      // ✅ Prepare item data for order with actual product info
      updatedItems.push({
        productId: product._id, // ✅ Use actual database _id
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.price,
        totalPrice: (item.unitPrice || product.price) * item.quantity,
        discount: item.discount || product.discount || 0,
        unit: product.unit,
        image: item.image || product.image || ''
      });
    }
    
    // ✅ Wait for all product updates
    console.log('\n💾 Saving product stock updates...');
    await Promise.all(productUpdates);
    
    // ✅ Calculate totals if not provided
    const calculatedSubtotal = subtotal || updatedItems.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0);
    
    const calculatedTotal = totalAmount || 
      (calculatedSubtotal - discountAmount + taxAmount + shippingCharge);
    
    console.log('\n💰 Order Summary:');
    console.log(`   Subtotal: ${calculatedSubtotal}`);
    console.log(`   Discount: ${discountAmount}`);
    console.log(`   Tax: ${taxAmount}`);
    console.log(`   Shipping: ${shippingCharge}`);
    console.log(`   Total: ${calculatedTotal}`);
    
    // ✅ Create order
    const order = new Order({
      storeId,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
        address: {
          street: customer.address.street.trim(),
          city: customer.address.city.trim(),
          state: customer.address.state.trim(),
          pincode: customer.address.pincode.trim(),
          landmark: customer.address.landmark?.trim() || ''
        }
      },
      items: updatedItems,
      subtotal: calculatedSubtotal,
      discountAmount:  0,
      taxAmount:  0,
      shippingCharge:  0,
      totalAmount: calculatedTotal,
      payment: {
        method: payment.method || 'cod',
        status: payment.status || (payment.method === 'online' ? 'completed' : 'pending'),
        transactionId: payment.transactionId,
        paidAmount: payment.method === 'cod' ? 0 : calculatedTotal
      },
      delivery: delivery || {},
      notes: notes || '',
      createdBy: createdBy || null,
      status: payment.method === 'cod' ? 'pending' : 'confirmed'
    });
    
    console.log('\n💾 Saving order to database...');
    await order.save();
    console.log(`✅ Order saved with ID: ${order.orderId}`);
    
    // ✅ Return success response
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderId: order.orderId,
        orderNumber: order.orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.payment.method,
        estimatedDelivery: order.delivery.expectedDate,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
          total: item.totalPrice
        })),
        customer: {
          name: order.customer.name,
          email: order.customer.email
        },
        createdAt: order.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Order placement error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to place order',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Get all orders (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');
    const customerEmail = searchParams.get('customerEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { storeId };

    if (status) query.status = status;
    if (customerEmail) query['customer.email'] = customerEmail.toLowerCase();
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.productId', 'name sku image')
        .lean(),
      Order.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get orders error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders',
        error: error.message 
      },
      { status: 500 }
    );
  }
}