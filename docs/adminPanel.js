
    // Tab functionality
    // Fetch and render admin stats and users dynamically
    async function fetchAdminStatsAndUsers() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Not authorized. Please log in as admin.');
            window.location.href = 'login.html';
            return;
        }
        try {
            // Fetch stats
            const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!statsRes.ok) throw new Error('Failed to fetch stats');
            const stats = await statsRes.json();
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('active-listings').textContent = stats.activeListings;
            document.getElementById('pending-swaps').textContent = stats.pendingSwaps;
            document.getElementById('completed-swaps').textContent = stats.completedSwaps;

            // Fetch users
            const usersRes = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!usersRes.ok) throw new Error('Failed to fetch users');
            const users = await usersRes.json();
            renderUsers(users);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    function addUserActionListeners() {
        // View
        document.querySelectorAll('.admin-action-btn.view').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = btn.getAttribute('data-id');
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await res.json();
                document.getElementById('user-details-content').innerHTML = `
                    <strong>Username:</strong> ${user.username}<br>
                    <strong>Email:</strong> ${user.email}<br>
                    <strong>Points:</strong> ${user.points}<br>
                    <strong>Avatar:</strong> <img src="${user.avatar}" style="width:40px;height:40px;border-radius:50%"><br>
                    <strong>Location:</strong> ${user.location}<br>
                    <strong>Created At:</strong> ${new Date(user.createdAt).toLocaleString()}<br>
                `;
                document.getElementById('user-modal').style.display = 'block';
            });
        });
        // Edit
        document.querySelectorAll('.admin-action-btn.edit').forEach(btn => {
            btn.addEventListener('click', async function() {
                const userId = btn.getAttribute('data-id');
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await res.json();
                document.getElementById('edit-user-id').value = user._id;
                document.getElementById('edit-username').value = user.username;
                document.getElementById('edit-email').value = user.email;
                document.getElementById('edit-points').value = user.points;
                document.getElementById('edit-avatar').value = user.avatar;
                document.getElementById('edit-location').value = user.location;
                document.getElementById('edit-user-modal').style.display = 'block';
            });
        });
        // Delete
        document.querySelectorAll('.admin-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = btn.getAttribute('data-id');
                document.getElementById('delete-user-modal').setAttribute('data-id', userId);
                document.getElementById('delete-user-modal').style.display = 'block';
            });
        });
    }

    // Modal close handlers
    function addModalCloseListeners() {
        document.getElementById('close-user-modal').onclick = function() {
            document.getElementById('user-modal').style.display = 'none';
        };
        document.getElementById('close-edit-user-modal').onclick = function() {
            document.getElementById('edit-user-modal').style.display = 'none';
        };
        document.getElementById('close-delete-user-modal').onclick = function() {
            document.getElementById('delete-user-modal').style.display = 'none';
        };
        document.getElementById('cancel-delete-user').onclick = function() {
            document.getElementById('delete-user-modal').style.display = 'none';
        };
    }

    // Edit user form submit
    function addEditUserFormListener() {
        document.getElementById('edit-user-form').onsubmit = async function(e) {
            e.preventDefault();
            const userId = document.getElementById('edit-user-id').value;
            const token = localStorage.getItem('token');
            const updatedUser = {
                username: document.getElementById('edit-username').value,
                email: document.getElementById('edit-email').value,
                points: document.getElementById('edit-points').value,
                avatar: document.getElementById('edit-avatar').value,
                location: document.getElementById('edit-location').value
            };
            await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser)
            });
            document.getElementById('edit-user-modal').style.display = 'none';
            fetchAdminStatsAndUsers();
        };
    }

    // Delete user confirm
    function addDeleteUserListener() {
        document.getElementById('confirm-delete-user').onclick = async function() {
            const userId = document.getElementById('delete-user-modal').getAttribute('data-id');
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            document.getElementById('delete-user-modal').style.display = 'none';
            fetchAdminStatsAndUsers();
        };
    }

    // Update renderUsers to add listeners after rendering
    function renderUsers(users) {
        const tbody = document.getElementById('admin-users-table-body');
        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${user.username}</strong><br>
                    ${user.email}<br>
                    Member since: ${new Date(user.createdAt).toLocaleDateString()}<br>
                    Listings: ${user.listings ? user.listings.length : 0} | Swaps: ${user.swapsCompleted || 0}
                </td>
                <td>
                    <button class="admin-action-btn view" data-id="${user._id}"><i class="fas fa-eye"></i> View</button>
                    <button class="admin-action-btn edit" data-id="${user._id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="admin-action-btn delete" data-id="${user._id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        addUserActionListeners();
    }

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
        fetchAdminStatsAndUsers();
        addModalCloseListeners();
        addEditUserFormListener();
        addDeleteUserListener();
    });
