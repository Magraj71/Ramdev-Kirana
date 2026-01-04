// types/index.ts
export interface Product {
  _id: string;
  storeId: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  mrp?: number;
  discount?: number;
  taxRate: number;
  stock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unit: string;
  description?: string;
  image?: string;
  images?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isActive: boolean;
  isFeatured?: boolean;
  supplier?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  reorderLevel: number;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Virtuals
  margin?: number;
  marginAmount?: number;
  stockStatus?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
  };
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharge: number;
  totalAmount: number;
  payment: {
    method: 'cod' | 'online' | 'card' | 'upi';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paidAmount: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  delivery?: {
    expectedDate?: Date;
    deliveredDate?: Date;
    trackingNumber?: string;
    deliveryAgent?: string;
  };
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Virtuals
  itemCount?: number;
  statusHistory?: { status: string; date: Date }[];
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  unit: string;
  image: string;
  stock: number;
  maxQuantity: number;
}