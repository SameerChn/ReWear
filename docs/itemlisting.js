        // JavaScript for image gallery functionality
        document.addEventListener('DOMContentLoaded', function() {
            const mainImage = document.querySelector('.main-image img');
            const thumbnails = document.querySelectorAll('.thumbnail img');
            
            // Change main image when thumbnail is clicked
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    mainImage.src = this.src;
                    mainImage.alt = this.alt;
                });
            });
            
            // Request swap button functionality
            const requestBtn = document.querySelector('.btn-primary');
            requestBtn.addEventListener('click', function() {
                alert('Swap request sent to Sarah! She has 48 hours to respond to your offer.');
            });
            
            // Save for later button functionality
            const saveBtn = document.querySelector('.btn-secondary');
            saveBtn.addEventListener('click', function() {
                this.textContent = 'Saved!';
                this.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    this.textContent = 'Saved for Later';
                }, 2000);
            });
        });