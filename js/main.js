function displayProducts(productsToShow) {
    console.log('Displaying products:', productsToShow);
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) {
        console.error('Products grid element not found');
        return;
    }

    if (!productsToShow || productsToShow.length === 0) {
        console.warn('No products to display');
        productsGrid.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    No products found to display.
                </div>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text">
                        <strong>$${product.price.toFixed(2)}</strong>
                        <span class="text-muted">(${product.stock} in stock)</span>
                    </p>
                    <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadProducts() {
    try {
        const priceRange = document.getElementById('priceRange')?.value || '';
        const selectedCategories = Array.from(document.querySelectorAll('.form-check-input:checked'))
            .map(input => input.value)
            .join(',');
        const sortBy = document.getElementById('sortProducts')?.value || '';

        const queryParams = new URLSearchParams({
            maxPrice: priceRange,
            categories: selectedCategories,
            sort: sortBy
        });

        console.log('Fetching products with params:', queryParams.toString());

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();

        console.log('Products fetched:', data);

        if (data.success) {
            displayProducts(data.products);
        } else {
            console.error('Failed to load products:', data.message);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Initialize filters
function initializeFilters() {
    const priceRange = document.getElementById('priceRange');
    const priceInput = document.getElementById('priceInput');
    const priceValue = document.getElementById('priceValue');
    const categoryFilters = document.querySelectorAll('.form-check-input');
    const sortSelect = document.getElementById('sortProducts');

    if (priceRange && priceInput && priceValue) {
        const updatePrice = (value) => {
            priceValue.textContent = `$${value}`;
            loadProducts();
        };

        priceRange.addEventListener('input', () => {
            priceInput.value = priceRange.value;
            updatePrice(priceRange.value);
        });

        priceInput.addEventListener('input', () => {
            priceRange.value = priceInput.value;
            updatePrice(priceInput.value);
        });
    }

    categoryFilters.forEach(filter => {
        filter.addEventListener('change', loadProducts);
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', loadProducts);
    }
}

// Call initializeFilters after loading products
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    initializeFilters();
});

function addToCart(product) {
    console.log('Adding to cart:', product);
    cart.addItem(product);
}

function processPayment() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const card = document.getElementById('card').value;
    const paymentAmount = document.getElementById('orderTotal').textContent;

    if (!name || !email || !address || !card) {
        alert('Please fill in all required fields.');
        return;
    }

    console.log('Processing payment for:', name, 'Amount:', paymentAmount);

    // Simulate payment processing
    setTimeout(() => {
        if (paymentAmount) {
            alert('Payment processed successfully!');
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            // Clear cart and redirect to confirmation page
            cart.clearCart();
        } else {
            alert('Failed to process payment. Please try again.');
        }
    }, 1000);
}