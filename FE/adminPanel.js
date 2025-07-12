
    // Tab functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Search functionality
        const searchInput = document.querySelector('.admin-search-input');
        const searchBtn = document.querySelector('.admin-search-btn');
        
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll('.admin-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });

        // Simulate loading data
        console.log('Admin panel loaded');
        // Here you would typically fetch admin data from an API
    });
