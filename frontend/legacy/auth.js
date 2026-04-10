// Authentication handling for AIAD
// Smart API URL Detection
const getApiUrl = () => {
    const backendHost = 'http://127.0.0.1:5000';
    const base = '/api/auth';

    // If opened via file:// OR from a different port (like Live Server 5500)
    if (window.location.protocol === 'file:' || window.location.port !== '5000') {
        return backendHost + base;
    }
    return base;
};

const API_URL = getApiUrl();

async function checkServerHealth() {
    try {
        const healthUrl = API_URL.replace('/api/auth', '/api/health');
        const response = await fetch(healthUrl, { mode: 'cors' });
        if (response.ok) {
            console.log('AIAD: Backend Health Checked ✅');
            return true;
        }
    } catch (err) {
        console.error('AIAD: Backend Reachability Test Failed ❌', err);
    }
    return false;
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Connecting...';

    try {
        const url = `${API_URL}/login`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        // JSON Guard: Check if we actually got JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Received non-JSON response:', text);
            throw new Error('Server returned HTML instead of JSON. Check if the backend is running correctly.');
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('aiad_user', data.user.username);
            localStorage.setItem('aiad_role', data.user.role);
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + data.message);
            btn.disabled = false;
            btn.innerText = originalText;
        }
    } catch (err) {
        console.error('Login Error:', err);
        alert(`Connectivity Error: ${err.message}\n\nTIP: Ensure the backend is running at http://127.0.0.1:5000\nTarget URL: ${API_URL}/login`);
        btn.disabled = false;
        btn.innerText = originalText;
    }
});

// Check if already logged in
if (localStorage.getItem('aiad_user')) {
    window.location.href = 'dashboard.html';
}

// Initial connection check
(async () => {
    const statusEl = document.getElementById('system-status');
    const isOnline = await checkServerHealth();
    if (isOnline) {
        statusEl.innerText = '● System Online';
        statusEl.className = 'status-badge online';
    } else {
        statusEl.innerText = '● System Offline';
        statusEl.className = 'status-badge offline';
    }
})();
