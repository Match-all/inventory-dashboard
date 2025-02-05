class ProfileManager {
    constructor() {
        this.avatarInput = document.getElementById('avatar-input');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.uploadButton = document.getElementById('upload-avatar');
        this.deleteButton = document.getElementById('delete-avatar');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Preview image before upload
        this.avatarInput.addEventListener('change', (e) => this.handlePreview(e));
        
        // Handle upload
        this.uploadButton.addEventListener('click', () => this.handleUpload());
        
        // Handle delete
        this.deleteButton.addEventListener('click', () => this.handleDelete());
    }

    handlePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async handleUpload() {
        const file = this.avatarInput.files[0];
        if (!file) {
            alert('Please select an image first');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/profile/upload-avatar', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                this.avatarPreview.src = data.avatar;
                alert('Profile image updated successfully!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert(`Error uploading image: ${error.message}`);
        }
    }

    async handleDelete() {
        if (!confirm('Are you sure you want to delete your profile picture?')) {
            return;
        }

        try {
            const response = await fetch('/profile/delete-avatar', {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                this.avatarPreview.src = '/default-avatar.png';
                this.avatarInput.value = '';
                alert('Profile image deleted successfully!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert(`Error deleting image: ${error.message}`);
        }
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
}); 