

        // Cart functionality
        const cartButton = document.getElementById('cart-button');
        const closeCart = document.getElementById('close-cart');
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('overlay');
        
        cartButton.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
        });
        
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        overlay.addEventListener('click', function() {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        // Filter toggle
        const filterButton = document.getElementById('filter-button');
        const filters = document.getElementById('filters');
        
        filterButton.addEventListener('click', function() {
            filters.classList.toggle('active');
        });
        
        // Filter options
        const filterOptions = document.querySelectorAll('.filter-option');
        
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                } else {
                    // Remove active class from siblings in the same group
                    const parentOptions = this.parentNode.querySelectorAll('.filter-option');
                    parentOptions.forEach(opt => opt.classList.remove('active'));
                    
                    this.classList.add('active');
                }
            });
        });
        
        // Add to cart functionality
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        const cartCount = document.querySelector('.cart-count');
        let count = 3; // Starting with 3 items in cart as per demo
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                // In a real app, you would add the actual product to cart
                count++;
                cartCount.textContent = count;
                
                // Visual feedback
                this.innerHTML = '<i class="fas fa-check"></i> Added';
                this.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-exchange-alt"></i> Request Swap';
                    this.style.backgroundColor = '';
                }, 2000);
            });
        });
        
        // Remove item from cart
        const removeButtons = document.querySelectorAll('.cart-item-remove');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                cartItem.style.animation = 'fadeOut 0.3s forwards';
                
                setTimeout(() => {
                    cartItem.remove();
                    count--;
                    cartCount.textContent = count;
                    
                    // Update total (in a real app, you'd recalculate properly)
                    if (count === 0) {
                        document.querySelector('.cart-header h3').textContent = 'Your Swap Requests (0)';
                        document.querySelector('.cart-total').textContent = 'Total: 0 points';
                    }
                }, 300);
            });
        });
        
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase();
                const productTitles = document.querySelectorAll('.product-title');
                
                productTitles.forEach(title => {
                    const productCard = title.closest('.product-card');
                    if (title.textContent.toLowerCase().includes(searchTerm)) {
                        productCard.style.display = 'block';
                    } else {
                        productCard.style.display = 'none';
                    }
                });
            }
        });