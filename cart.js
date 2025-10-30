// ConceptBA Global Cart Management
class ConceptBACart {
  constructor() {
    this.cart = this.loadCart(); // Restore cart persistence
    this.init();
  }

  // Load cart from localStorage - restore persistence
  loadCart() {
    try {
      const savedCart = localStorage.getItem('conceptba-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  // Save cart to localStorage - restore persistence
  saveCart() {
    try {
      localStorage.setItem('conceptba-cart', JSON.stringify(this.cart));
      this.updateAllCartCounters();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Get total item count
  getTotalCount() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  }

  // Update all cart counters on the page
  updateAllCartCounters() {
    const count = this.getTotalCount();
    
    // Update desktop cart counter
    const desktopCounter = document.getElementById('cart-counter');
    if (desktopCounter) {
      desktopCounter.textContent = count;
    }

    // Update mobile cart counter
    const mobileCounter = document.querySelector('.cart-counter-mobile');
    if (mobileCounter) {
      mobileCounter.textContent = count;
    }

    // Save count to localStorage for compatibility
    localStorage.setItem('conceptba-cart-count', count.toString());
  }

  // Add item to cart
  addItem(name, price, qty = 1) {
    if (!name || !price) {
      console.error('Invalid item data');
      return false;
    }

    // Check if product already exists in cart
    const existingItem = this.cart.find(item => item.name === name && item.price === price);
    
    if (existingItem) {
      existingItem.qty += qty;
    } else {
      this.cart.push({ name, price, qty });
    }

    this.saveCart();
    return true;
  }

  // Remove item from cart by index
  removeItem(index) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.saveCart();
      return true;
    }
    return false;
  }

  // Clear entire cart
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // Get cart contents
  getCart() {
    return [...this.cart]; // Return a copy
  }

  // Calculate totals and discounts
  calculateTotals() {
    let subtotal = this.cart.reduce((s, it) => s + it.price * it.qty, 0);
    let discount = 0;

    // Promo A: Llevá 2 productos y obtené 50% en el segundo.
    this.cart.forEach(item => {
      if (item.qty >= 2) {
        const pairs = Math.floor(item.qty / 2);
        discount += pairs * (item.price * 0.5);
      }
    });

    // Promo B: 3x2 en productos seleccionados (≤ $120)
    this.cart.forEach(item => {
      if (item.price <= 120 && item.qty >= 3) {
        const freeItems = Math.floor(item.qty / 3);
        discount += freeItems * item.price;
      }
    });

    // Promo C: 10% off for subtotal over $3000
    const subtotalAfterDiscounts = subtotal - discount;
    if (subtotalAfterDiscounts > 3000) {
      discount += subtotalAfterDiscounts * 0.10;
    }

    const total = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount,
      total,
      itemCount: this.getTotalCount()
    };
  }

  // Initialize cart functionality
  init() {
    // Update counters when page loads
    document.addEventListener('DOMContentLoaded', () => {
      this.updateAllCartCounters();
    });

    // If counters are already loaded, update them immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateAllCartCounters();
      });
    } else {
      this.updateAllCartCounters();
    }
  }
}

// Create global cart instance
window.conceptBACart = new ConceptBACart();

// Global functions for easy access
window.addToCart = (name, price, qty = 1) => {
  return window.conceptBACart.addItem(name, price, qty);
};

window.removeFromCart = (index) => {
  return window.conceptBACart.removeItem(index);
};

// Banner management functions - no persistence
window.closeBanner = () => {
  // Just hide the banner, don't save state
  const banner = document.getElementById('discount-banner');
  if (banner) {
    banner.style.display = 'none';
  }
};

window.initBanner = () => {
  // Banner always shows on page load - no persistence check
  // Do nothing - banner shows by default
};

window.clearCart = () => {
  window.conceptBACart.clearCart();
};

window.getCart = () => {
  return window.conceptBACart.getCart();
};

window.getCartTotals = () => {
  return window.conceptBACart.calculateTotals();
};