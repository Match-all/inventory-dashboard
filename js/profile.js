document.addEventListener('DOMContentLoaded', async () => {
    try {
        const profileResponse = await fetch('/api/user/profile', { credentials: 'include' });
        const profileData = await profileResponse.json();
        console.log('Profile Data:', profileData); // Debugging line

        if (!profileData.success) {
            window.location.href = '/pages/auth.html';
            return;
        }

        updateProfileInfo(profileData.user);

        // Load user-specific data
        await loadUserData();
    } catch (error) {
        console.error('Profile load error:', error);
        window.location.href = '/pages/auth.html';
    }
});

function updateProfileInfo(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('totalOrders').textContent = user.totalOrders;
    document.getElementById('wishlistCount').textContent = user.wishlistCount;
    document.getElementById('reviewsCount').textContent = user.reviewsCount;
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email')
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Profile updated successfully', 'success');
            updateProfileInfo(data.user);
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            modal.hide();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Failed to update profile', 'error');
    }
}

async function loadUserData() {
    try {
        // Load profile data
        const profileResponse = await fetch('/api/user/profile', { 
            credentials: 'include' 
        });
        const profileData = await profileResponse.json();
        console.log('Profile Data:', profileData);
        
        if (profileData.success) {
            document.getElementById('profileName').textContent = profileData.user.name;
            document.getElementById('profileEmail').textContent = profileData.user.email;
        }

        // Load orders
        const ordersResponse = await fetch('/api/user/orders', { 
            credentials: 'include' 
        });
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success) {
            displayOrders(ordersData.orders);
        }
    } catch (error) {
        console.error('Data load error:', error);
        showToast('Error loading user data', 'error');
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersList');
    const recentOrdersContainer = document.getElementById('recentOrders');
    
    if (!orders || orders.length === 0) {
        const noOrdersMessage = '<p class="text-muted text-center">No orders found</p>';
        if (ordersContainer) ordersContainer.innerHTML = noOrdersMessage;
        if (recentOrdersContainer) recentOrdersContainer.innerHTML = noOrdersMessage;
        document.getElementById('totalOrders').textContent = '0';
        return;
    }

    // Update total orders count
    document.getElementById('totalOrders').textContent = orders.length;

    // Display recent orders (last 3)
    if (recentOrdersContainer) {
        const recentOrders = orders.slice(0, 3);
        recentOrdersContainer.innerHTML = recentOrders.map(order => `
            <div class="order-item mb-3">
                <div class="d-flex justify-content-between">
                    <small>Order #${order.orderId}</small>
                    <small>${new Date(order.date).toLocaleDateString()}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span>Total: $${order.total.toFixed(2)}</span>
                    <span class="badge bg-success">${order.status}</span>
                </div>
            </div>
        `).join('');
    }

    // Display all orders in modal
    if (ordersContainer) {
        ordersContainer.innerHTML = orders.map(order => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Order #${order.orderId}</h6>
                        <span class="badge bg-success">${order.status}</span>
                    </div>
                    <p class="text-muted mb-2">Ordered on: ${new Date(order.date).toLocaleDateString()}</p>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <strong>Total:</strong>
                        <strong>$${order.total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateWishlist(items) {
    const container = document.getElementById('userWishlist');
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No items in wishlist</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>${item.name}</strong>
                <br>
                <small class="text-muted">${item.description}</small>
            </div>
        </div>
    `).join('');
}

function updateReviews(reviews) {
    const container = document.getElementById('userReviews');
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No reviews yet</p>';
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>${review.productName}</strong>
                <br>
                <small class="text-muted">${review.comment}</small>
            </div>
            <span class="badge bg-secondary">${review.rating} Stars</span>
        </div>
    `).join('');
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'completed': return 'success';
        case 'processing': return 'primary';
        case 'shipped': return 'info';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            // Update profile information
            document.getElementById('profileName').textContent = data.user.name;
            document.getElementById('profileEmail').textContent = data.user.email;
            
            // Update form fields
            document.getElementById('editName').value = data.user.name;
            document.getElementById('editEmail').value = data.user.email;
        } else {
            window.location.href = '/pages/auth.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

async function loadUserOrders() {
    try {
        const response = await fetch('/api/user/orders', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            // Update orders count
            document.getElementById('totalOrders').textContent = data.orders.length;
            
            // Display recent orders
            const recentOrders = data.orders.slice(0, 3);
            displayRecentOrders(recentOrders);
            
            // Update orders modal
            displayAllOrders(data.orders);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

function displayRecentOrders(orders) {
    const recentOrdersContainer = document.getElementById('recentOrders');
    
    if (!orders || orders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="text-muted text-center">No recent orders</p>';
        return;
    }

    const ordersHTML = orders.map(order => `
        <div class="order-item mb-3">
            <div class="d-flex justify-content-between">
                <small>Order #${order.orderId}</small>
                <small>${new Date(order.date).toLocaleDateString()}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <span>Total: $${order.total.toFixed(2)}</span>
                <span class="badge bg-success">${order.status}</span>
            </div>
        </div>
    `).join('');

    recentOrdersContainer.innerHTML = ordersHTML;
}

function displayAllOrders(orders) {
    const ordersListContainer = document.getElementById('ordersList');
    
    if (!orders || orders.length === 0) {
        ordersListContainer.innerHTML = '<p class="text-muted text-center">No orders found</p>';
        return;
    }

    const ordersHTML = orders.map(order => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Order #${order.orderId}</h6>
                    <span class="badge bg-success">${order.status}</span>
                </div>
                <p class="text-muted mb-2">Ordered on: ${new Date(order.date).toLocaleDateString()}</p>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <strong>Total:</strong>
                    <strong>$${order.total.toFixed(2)}</strong>
                </div>
            </div>
        </div>
    `).join('');

    ordersListContainer.innerHTML = ordersHTML;
}

// Load profile data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadUserOrders();
}); 