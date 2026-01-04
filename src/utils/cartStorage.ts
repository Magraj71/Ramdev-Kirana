// utils/cartStorage.ts
export const CART_KEY = "shopping_cart";

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

export const cartStorage = {
  // Get cart from localStorage
  getCart(): CartItem[] {
    try {
      const cartJson = localStorage.getItem(CART_KEY);
      return cartJson ? JSON.parse(cartJson) : [];
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return [];
    }
  },

  // Save cart to localStorage
  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  },

  // Add item to cart
  addItem(item: CartItem): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.productId === item.productId);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].totalPrice = cart[existingIndex].unitPrice * cart[existingIndex].quantity;
    } else {
      cart.push(item);
    }
    
    this.saveCart(cart);
    return cart;
  },

  // Remove item from cart
  removeItem(productId: string): CartItem[] {
    const cart = this.getCart();
    const newCart = cart.filter(item => item.productId !== productId);
    this.saveCart(newCart);
    return newCart;
  },

  // Update item quantity
  updateQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      
      cart[itemIndex].quantity = quantity;
      cart[itemIndex].totalPrice = cart[itemIndex].unitPrice * quantity;
      this.saveCart(cart);
    }
    
    return cart;
  },

  // Clear cart
  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  // Get cart total
  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  },

  // Get item count
  getItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};