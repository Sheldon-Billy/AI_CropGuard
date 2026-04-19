// Shared nav user widget
(function () {
  const user = JSON.parse(localStorage.getItem('cg_user') || 'null');
  const el   = document.getElementById('navAuthLinks');
  if (!el) return;

  if (user) {
    const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const contact  = user.email || user.phone || '';

    // Replace login/register with avatar widget
    el.innerHTML = `
      <li class="nav-user-li" style="position:relative; list-style:none;">
        <div class="nav-user" id="navUserBtn" onclick="toggleUserMenu(event)">
          <div class="nav-avatar">${initials}</div>
          <span class="nav-username">${user.full_name.split(' ')[0]}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="nav-dropdown" id="navDropdown">
          <div class="nav-dropdown-header">
            <div class="nav-avatar-lg">${initials}</div>
            <div>
              <strong>${user.full_name}</strong>
              <span>${contact}</span>
            </div>
          </div>
          <a href="index.html" class="nav-dropdown-item">Home</a>
          <a href="detection.html" class="nav-dropdown-item">Detect Disease</a>
          <a href="detection.html#historySection" class="nav-dropdown-item">My History</a>

          <div class="nav-dropdown-divider"></div>
          <a href="#" class="nav-dropdown-item nav-logout" onclick="navLogout(event)">Logout</a>
        </div>
      </li>`;
  }

  document.addEventListener('click', function (e) {
    const btn = document.getElementById('navUserBtn');
    const dd  = document.getElementById('navDropdown');
    if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
    }
  });
})();

function toggleUserMenu(e) {
  e.stopPropagation();
  document.getElementById('navDropdown').classList.toggle('open');
}

function navLogout(e) {
  e.preventDefault();
  localStorage.removeItem('cg_token');
  localStorage.removeItem('cg_user');
  window.location.href = 'login.html';
}
