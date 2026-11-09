
// ================================
// AUTHENTICATION API
// ================================

let authMode = 'login';

// Cập nhật nút đăng nhập / đăng xuất
function updateAuthControls(user) {
    const controls = document.getElementById('authControls');

    controls.replaceChildren();

    if (!user) {
        const loginButton = document.createElement('button');

        loginButton.type = 'button';
        loginButton.className = 'flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium transition-all';

        loginButton.innerHTML = `
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Đăng nhập</span>
        `;

        loginButton.addEventListener('click', () => openAuthModal('login'));

        controls.append(loginButton);

    } else {
        const name = document.createElement('span');

        name.className = 'hidden sm:inline max-w-32 truncate text-xs text-slate-300';
        name.textContent = user.displayName;
        name.title = user.email;

        controls.append(name);

        const logoutButton = document.createElement('button');

        logoutButton.type = 'button';
        logoutButton.className = 'flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium transition-all';

        logoutButton.innerHTML = `
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Đăng xuất</span>
        `;

        logoutButton.addEventListener('click', logout);

        controls.append(logoutButton);
    }

    lucide.createIcons();
}


// Kiểm tra phiên đăng nhập
async function restoreAuthSession() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'same-origin'
        });

        if (response.status === 401) {
            updateAuthControls(null);
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || 'Không thể kiểm tra phiên đăng nhập.'
            );
        }

        updateAuthControls(result.user);

    } catch (error) {
        updateAuthControls(null);

        showToast(
            'Không thể kết nối',
            error.message || 'Hãy mở trang qua backend EduShare.'
        );
    }
}


// Mở modal đăng nhập / đăng ký
function openAuthModal(mode = 'login') {
    authMode = mode;

    updateAuthModal();

    openModal('authModal');
}


// Chuyển đổi đăng nhập và đăng ký
function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';

    updateAuthModal();
}


// Cập nhật giao diện modal xác thực
function updateAuthModal() {
    const isRegistering = authMode === 'register';

    document.getElementById('authModalTitle').textContent =
        isRegistering
            ? 'Tạo tài khoản EduShare'
            : 'Đăng nhập EduShare';

    document.getElementById('authNameField')
        .classList.toggle('hidden', !isRegistering);

    document.getElementById('authDisplayName').required =
        isRegistering;

    document.getElementById('authPassword').autocomplete =
        isRegistering ? 'new-password' : 'current-password';

    document.getElementById('authPasswordHint')
        .classList.toggle('hidden', !isRegistering);

    document.getElementById('authSubmitButton').textContent =
        isRegistering ? 'Đăng ký' : 'Đăng nhập';

    document.getElementById('authModeToggle').textContent =
        isRegistering
            ? 'Đã có tài khoản? Đăng nhập'
            : 'Chưa có tài khoản? Đăng ký';

    document.getElementById('authError')
        .classList.add('hidden');
}


// Xử lý đăng nhập và đăng ký
async function handleAuthSubmit(event) {
    event.preventDefault();

    const errorElement = document.getElementById('authError');
    const submitButton = document.getElementById('authSubmitButton');

    errorElement.classList.add('hidden');
    submitButton.disabled = true;

    const payload = {
        email: document.getElementById('authEmail').value,
        password: document.getElementById('authPassword').value
    };

    if (authMode === 'register') {
        payload.displayName =
            document.getElementById('authDisplayName').value;
    }

    try {
        const response = await fetch(`/api/auth/${authMode}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || 'Không thể xác thực tài khoản.'
            );
        }

        updateAuthControls(result.user);

        closeModal('authModal');

        document.getElementById('authForm').reset();

        showToast(
            authMode === 'register'
                ? 'Đăng ký thành công'
                : 'Đăng nhập thành công',
            `Xin chào ${result.user.displayName}!`
        );

        addLog(
            `[Auth] ${authMode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'} thành công.`
        );

    } catch (error) {
        errorElement.textContent =
            error instanceof TypeError
                ? 'Không thể kết nối máy chủ. Hãy khởi động backend EduShare.'
                : error.message;

        errorElement.classList.remove('hidden');

    } finally {
        submitButton.disabled = false;
    }
}


// Đăng xuất
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const result = await response.json();

            throw new Error(
                result.error || 'Không thể đăng xuất.'
            );
        }

        updateAuthControls(null);

        showToast(
            'Đã đăng xuất',
            'Bạn đã đăng xuất khỏi EduShare.'
        );

        addLog('[Auth] Đăng xuất thành công.');

    } catch (error) {
        showToast(
            'Đăng xuất thất bại',
            error instanceof TypeError
                ? 'Không thể kết nối máy chủ. Vui lòng thử lại.'
                : error.message
        );
    }
}
