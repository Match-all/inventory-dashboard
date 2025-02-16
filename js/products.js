async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
            setupFilters(data.products);
        } else {
            showToast('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<p class="text-center w-100">No products found</p>';
        return;
    }

    const productsHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><small class="text-muted">Stock: ${product.stock}</small></p>
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">$${product.price.toFixed(2)}</h6>
                        <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    productsGrid.innerHTML = productsHTML;
}

function setupFilters(products) {
    // Price Range
    const priceRange = document.getElementById('priceRange');
    const priceInput = document.getElementById('priceInput');
    const maxPrice = Math.max(...products.map(p => p.price));
    
    priceRange.max = maxPrice;
    priceRange.value = maxPrice;
    priceInput.max = maxPrice;
    priceInput.value = maxPrice;
    
    // Update price display
    document.getElementById('priceValue').textContent = `$${maxPrice}`;
    
    // Event listeners for filters
    priceRange.addEventListener('input', filterProducts);
    priceInput.addEventListener('input', filterProducts);
    document.querySelectorAll('.form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    document.getElementById('sortProducts').addEventListener('change', filterProducts);
}

function filterProducts() {
    const maxPrice = document.getElementById('priceRange').value;
    const categories = Array.from(document.querySelectorAll('.form-check-input:checked')).map(cb => cb.value);
    const sortBy = document.getElementById('sortProducts').value;
    
    fetch(`/api/products/filter?maxPrice=${maxPrice}&categories=${categories.join(',')}&sort=${sortBy}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayProducts(data.products);
        }
    })
    .catch(error => {
        console.error('Error filtering products:', error);
        showToast('Error filtering products', 'error');
    });
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', loadProducts); 