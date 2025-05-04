// Cart Class
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }
    
    addItem(itemId, quantity = 1) {
        const existingItem = this.items.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const menuItem = getMenuItemById(itemId);
            if (!menuItem) {
                console.error('Cannot add item - not found in menu:', itemId);
                return false;
            }
            
            this.items.push({ 
                id: itemId, 
                quantity,
                price: menuItem.price,
                name: menuItem.name,
                image_path: menuItem.image_path
            });
        }
        
        this.save();
        return true;
    }
    
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.save();
    }
    
    updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            this.save();
        }
    }
    
    clear() {
        this.items = [];
        this.save();
    }
    
    getItems() {
        return this.items;
    }
    
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
}

// Slider Class
class Slider {
    constructor(selector, options = {}) {
        this.slider = document.querySelector(selector);
        this.slides = this.slider.querySelectorAll('.slide');
        this.dotsContainer = this.slider.querySelector('.dots');
        this.prevBtn = this.slider.querySelector('.prev-slide');
        this.nextBtn = this.slider.querySelector('.next-slide');
        
        this.options = {
            autoPlay: options.autoPlay || false,
            interval: options.interval || 2500,  // Reduced from 3000 to 2500ms (2.5s)
            transitionSpeed: options.transitionSpeed || 300  // New option for transition speed (300ms)
        };
        
        this.currentIndex = 0;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        if (this.dotsContainer) {
            this.slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
            
            this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        this.showSlide(this.currentIndex);
    }
    
    showSlide(index) {
        // First apply a "transitioning" class with our fast transition
        this.slides.forEach(slide => {
            slide.style.transition = `all ${this.options.transitionSpeed}ms ease-in-out`;
        });
        
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        if (this.dotsContainer) {
            const dots = this.dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        this.currentIndex = index;
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    startAutoPlay() {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(() => {
            this.nextSlide();
        }, this.options.interval);
    }
    
    stopAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.querySelector('i').classList.toggle('fa-times');
            menuBtn.querySelector('i').classList.toggle('fa-bars');
        });
    }
}

// Form Validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const inputs = this.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fill in all required fields', 'error');
            }
        });
        
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        requiredFields.forEach(field => {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('error');
                }
            });
        });
    });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Get menu item by ID from DOM
function getMenuItemById(id) {
    const menuItemElement = document.querySelector(`.menu-item .add-to-cart-btn[data-id="${id}"]`)?.closest('.menu-item');
    
    if (!menuItemElement) {
        console.error('Menu item not found for ID:', id);
        return null;
    }
    
    return {
        id: parseInt(id),
        name: menuItemElement.querySelector('h3').textContent,
        price: parseFloat(menuItemElement.querySelector('.price').textContent.replace('$', '')),
        description: menuItemElement.querySelector('.description').textContent,
        image_path: menuItemElement.querySelector('img').src.split('/').pop()
    };
}

// Update cart UI
function updateCartUI() {
    const cart = new Cart();
    const cartItems = cart.getItems();
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmountElement = document.querySelector('.total-amount');
    const cartCountElement = document.querySelector('.cart-count');
    
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        totalAmountElement.textContent = '$0.00';
        cartCountElement.textContent = '0';
        return;
    }
    
    let total = 0;
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="cart-item-total">
                $${itemTotal.toFixed(2)}
            </div>
            <button class="remove-item" data-id="${item.id}">&times;</button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
    cartCountElement.textContent = cart.getTotalItems().toString();
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            cart.removeItem(itemId);
            updateCartUI();
            showToast('Item removed from cart');
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sliders
    document.querySelectorAll('.slider-container').forEach(slider => {
        new Slider(slider);
    });
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup form validation
    setupFormValidation();
    
    // Close flash messages when clicked
    document.querySelectorAll('.flash-message').forEach(message => {
        message.addEventListener('click', function() {
            this.remove();
        });
    });
    
    // Admin dropdown
    const adminDropdown = document.querySelector('.admin-dropdown');
    if (adminDropdown) {
        adminDropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('admin-btn')) {
                this.querySelector('.admin-menu').classList.toggle('show');
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!adminDropdown.contains(e.target)) {
                adminDropdown.querySelector('.admin-menu').classList.remove('show');
            }
        });
    }
    
    // Initialize cart functionality
    updateCartUI();
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const quantity = parseInt(this.closest('.item-actions').querySelector('.quantity').value);
            
            const cart = new Cart();
            if (cart.addItem(itemId, quantity)) {
                updateCartUI();
                showToast('Item added to cart!');
            }
        });
    });
    
    // Cart icon click
    document.querySelector('.cart-icon')?.addEventListener('click', function() {
        document.querySelector('.cart-overlay').classList.add('active');
    });
    
    // Close cart
    document.querySelector('.close-cart')?.addEventListener('click', function() {
        document.querySelector('.cart-overlay').classList.remove('active');
    });
});

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Escape key closes modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});