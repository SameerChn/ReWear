
  
        // Tab functionality
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Simulate loading data
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Dashboard loaded');
            // Here you would typically fetch user data and listings from an API
        });
 