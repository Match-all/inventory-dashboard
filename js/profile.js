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
        // Load orders
        const ordersResponse = await fetch('/api/user/orders', { credentials: 'include' });
        const ordersData = await ordersResponse.json();
        console.log('Fetched Orders:', ordersData); // Debugging line
        if (ordersData.success) {
            updateOrders(ordersData.orders);
        }

        // Load wishlist
        const wishlistResponse = await fetch('/api/user/wishlist', { credentials: 'include' });
        const wishlistData = await wishlistResponse.json();
        if (wishlistData.success) {
            updateWishlist(wishlistData.items);
        }

        // Load reviews
        const reviewsResponse = await fetch('/api/user/reviews', { credentials: 'include' });
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
            updateReviews(reviewsData.reviews);
        }
    } catch (error) {
        console.error('Data load error:', error);
    }
}

function updateOrders(orders) {
    const container = document.getElementById('recentOrders');
    if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No recent orders</p>';
        return;
    }

    container.innerHTML = orders.slice(0, 5).map(order => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>Order #${order.orderId}</strong>
                <br>
                <small class="text-muted">${new Date(order.date).toLocaleDateString()}</small>
            </div>
            <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span>
        </div>
    `).join('');

    // Load all orders into the modal
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = orders.map(order => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">Order #${order.orderId}</h5>
                <p class="card-text">
                    <strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}<br>
                    <strong>Status:</strong> <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span><br>
                    <strong>Total:</strong> $${order.total}
                </p>
            </div>
        </div>
    `).join('');
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