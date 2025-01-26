class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartDisplay();
        this.updateCartCount();
        this.setupEventListeners();
    }

    addItem(product) {
        console.log('addItem called with:', product);
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
                this.showToast(`${product.name} quantity increased`);
            } else {
                this.showToast(`Cannot add more ${product.name}. Only ${product.stock} in stock.`, 'warning');
            }
        } else {
            if (product.stock > 0) {
                this.items.push({
                    ...product,
                    quantity: 1
                });
                this.showToast(`${product.name} added to cart`);
            } else {
                this.showToast(`${product.name} is out of stock`, 'warning');
            }
        }
        
        this.saveCart();
        this.updateCartDisplay();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== parseInt(productId));
        this.saveCart();
        this.updateCartDisplay();
        this.showToast('Item removed from cart');
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === parseInt(productId));
        if (item) {
            const newQuantity = parseInt(quantity);
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else if (newQuantity <= item.stock) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.showToast(`Quantity updated for ${item.name}`);
            } else {
                // Reset to max stock and show a warning
                const inputField = document.querySelector(`input[value="${newQuantity}"]`);
                if (inputField) {
                    inputField.value = item.stock;
                }
                this.showToast(`Cannot exceed stock limit of ${item.stock} for ${item.name}`, 'warning');
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">${item.name}</h6>
                                <p class="text-muted mb-0">$${parseFloat(item.price).toFixed(2)} × ${item.quantity}</p>
                            </div>
                            <div class="d-flex align-items-center">
                                <input type="number" class="form-control form-control-sm me-2" 
                                    style="width: 60px" value="${item.quantity}" min="1" max="${item.stock}"
                                    onchange="cart.updateQuantity('${item.id}', this.value)">
                                <button class="btn btn-sm btn-danger" onclick="cart.removeItem('${item.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = this.items.length === 0;
        }
    }

    async checkoutClicked() {
        try {
            // Check authentication status
            const response = await fetch('http://localhost:3000/api/check-auth', {
                credentials: 'include'
            });
            const data = await response.json();

            if (!data.success) {
                // User is not logged in
                this.showToast('Please login to proceed with checkout', 'warning');
                
                // Close cart modal if open
                const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
                if (cartModal) {
                    cartModal.hide();
                }

                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 500);

                return; // Ensure no further code is executed
            }

            // User is logged in, proceed with checkout
            const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
            paymentModal.show();
        } catch (error) {
            console.error('Auth check error:', error);
            this.showToast('Error checking authentication status', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'danger' : 
                       type === 'warning' ? 'warning' : 'success';
        
        toast.className = `toast align-items-center text-white bg-${bgColor}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    setupEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = {
                        id: productCard.dataset.productId,
                        name: productCard.dataset.productName,
                        price: productCard.dataset.productPrice,
                        image: productCard.dataset.productImage
                    };
                    this.addItem(product);
                }
            });
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkoutClicked());
        }

        // Previous and Next buttons
        document.getElementById('previousPage').addEventListener('click', function() {
            console.log('Previous page');
        });

        document.getElementById('nextPage').addEventListener('click', function() {
            console.log('Next page');
        });
    }
}

// Initialize cart
const cart = new Cart();

// Make cart globally available
window.cart = cart;