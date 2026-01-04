const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface OrderData {
  storeId: string;
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
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    unit: string;
    image?: string;
  }>;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingCharge?: number;
  totalAmount: number;
  payment: {
    method: 'cod' | 'online' | 'card' | 'upi';
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
  };
  delivery?: {
    expectedDate?: Date;
    trackingNumber?: string;
  };
  notes?: string;
  createdBy?: string;
}

export const orderAPI = {
  // Place a new order
  async placeOrder(orderData: OrderData) {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }

    return data;
  },

  // Get order by ID
  async getOrder(orderId: string) {
    const response = await fetch(`${API_BASE}/orders/${orderId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  },

  // Get customer orders
  async getCustomerOrders(email: string, storeId: string, limit = 20) {
    const response = await fetch(
      `${API_BASE}/orders/customer/${encodeURIComponent(email)}?storeId=${storeId}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer orders');
    }

    return response.json();
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, updatedBy?: string) {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, updatedBy }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order');
    }

    return data;
  },

  // Get orders with filters
  async getOrders(params: {
    storeId: string;
    status?: string;
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/orders?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
};
