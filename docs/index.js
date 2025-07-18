// JavaScript for landing page functionality
document.addEventListener('DOMContentLoaded', function () {
    // Handle loading animation replacement after 3 seconds
    const loadingSection = document.querySelector('.loading-section');

    setTimeout(() => {
        loadingSection.innerHTML = `
            <h2>Matches Found!</h2>
            <p>We've found 12 perfect swaps for you in your area.</p>
            <button class="cta-button" id="view-matches">View Matches</button>
        `;

        // Add click handler after element is added to DOM
        const viewMatchesBtn = document.getElementById('view-matches');
        viewMatchesBtn.addEventListener('click', () => {
            window.location.href = 'itemlisting.html';
        });
    }, 3000);

    // Smooth scroll only for anchor links (href="#something")
    document.querySelectorAll('nav a').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // Redirect "Get Started" button to browse.html
    const getStartedBtn = document.querySelector('.hero .cta-button');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            window.location.href = 'upload.html';
        });
    }
});
