export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  storeName?: string;
  storeType?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'owner';
  status: 'active' | 'inactive';
  customerType?: 'regular' | 'wholesale' | 'retail';
}