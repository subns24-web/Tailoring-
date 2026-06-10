/* TailorPro – Full SPA */
'use strict';

// ── Data Layer ────────────────────────────────────────────
const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem('tp_' + k)) || []; } catch { return []; } },
  set(k, v) { localStorage.setItem('tp_' + k, JSON.stringify(v)); },
  getObj(k, def = {}) { try { return JSON.parse(localStorage.getItem('tp_' + k)) || def; } catch { return def; } },
  setObj(k, v) { localStorage.setItem('tp_' + k, JSON.stringify(v)); },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
const today = () => new Date().toISOString().slice(0, 10);
const daysLeft = (d) => { if (!d) return null; const diff = Math.ceil((new Date(d) - new Date()) / 86400000); return diff; };
const initials = (name) => (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// seed demo data if empty
function seedDemo() {
  if (DB.get('customers').length) return;
  const c1 = uid(), c2 = uid(), c3 = uid();
  DB.set('customers', [
    { id: c1, name: 'Arjun Sharma', phone: '9876543210', email: 'arjun@email.com', address: '12 MG Road, Delhi', notes: 'Prefers slim fit', createdAt: '2026-05-10', measurements: { chest: 40, waist: 34, hips: 38, shoulder: 17, sleeveLength: 25, inseam: 30, neck: 15, backLength: 18, thigh: 22, frontLength: 28, outseam: 41, unit: 'in' } },
    { id: c2, name: 'Priya Mehta', phone: '8765432109', email: 'priya@email.com', address: '5 Linking Rd, Mumbai', notes: 'Likes pastel colours', createdAt: '2026-05-15', measurements: { chest: 36, waist: 28, hips: 38, shoulder: 14, sleeveLength: 22, inseam: 28, neck: 13, backLength: 16, thigh: 20, frontLength: 24, outseam: 38, unit: 'in' } },
    { id: c3, name: 'Rahul Verma', phone: '7654321098', email: 'rahul@email.com', address: '8 Anna Nagar, Chennai', notes: '', createdAt: '2026-06-01', measurements: null },
  ]);
  const o1 = uid(), o2 = uid(), o3 = uid();
  DB.set('orders', [
    { id: o1, orderNo: 'TP-001', customerId: c1, customerName: 'Arjun Sharma', items: [{ type: 'Suit', fabric: 'Navy Wool', qty: 1, price: 8500 }, { type: 'Shirt', fabric: 'White Cotton', qty: 2, price: 1200 }], status: 'stitching', deadline: '2026-06-15', advance: 5000, totalAmount: 10900, notes: 'Wedding occasion', createdAt: '2026-06-01' },
    { id: o2, orderNo: 'TP-002', customerId: c2, customerName: 'Priya Mehta', items: [{ type: 'Salwar Suit', fabric: 'Pink Chiffon', qty: 1, price: 4500 }], status: 'ready', deadline: '2026-06-10', advance: 2000, totalAmount: 4500, notes: '', createdAt: '2026-06-03' },
    { id: o3, orderNo: 'TP-003', customerId: c3, customerName: 'Rahul Verma', items: [{ type: 'Pant', fabric: 'Grey Blend', qty: 2, price: 1800 }], status: 'pending', deadline: '2026-06-20', advance: 1000, totalAmount: 3600, notes: 'Formal trousers', createdAt: '2026-06-05' },
  ]);
  DB.set('appointments', [
    { id: uid(), customerId: c1, customerName: 'Arjun Sharma', date: today(), time: '10:00', type: 'Fitting', status: 'scheduled', notes: 'Final fitting for suit' },
    { id: uid(), customerId: c2, customerName: 'Priya Mehta', date: today(), time: '14:30', type: 'Delivery', status: 'scheduled', notes: '' },
    { id: uid(), customerId: c3, customerName: 'Rahul Verma', date: new Date(Date.now() + 86400000).toISOString().slice(0,10), time: '11:00', type: 'Measurement', status: 'scheduled', notes: 'First visit' },
  ]);
  DB.set('fabrics', [
    { id: uid(), name: 'Navy Premium Wool', type: 'Wool', color: '#1a2a5e', pattern: 'Solid', pricePerMeter: 850, stock: 12 },
    { id: uid(), name: 'White Cotton Poplin', type: 'Cotton', color: '#f5f5f5', pattern: 'Solid', pricePerMeter: 280, stock: 25 },
    { id: uid(), name: 'Pink Chiffon', type: 'Chiffon', color: '#ffb3c6', pattern: 'Solid', pricePerMeter: 420, stock: 3 },
    { id: uid(), name: 'Charcoal Linen', type: 'Linen', color: '#4a4a4a', pattern: 'Solid', pricePerMeter: 560, stock: 8 },
    { id: uid(), name: 'Floral Georgette', type: 'Georgette', color: '#ff6b6b', pattern: 'Floral', pricePerMeter: 390, stock: 15 },
  ]);
  DB.setObj('settings', { shopName: 'TailorPro Studio', ownerName: 'Owner', phone: '9999999999', address: '1 Fashion Street, City', currency: '₹', gst: '18', nextOrderNo: 4, prices: { Shirt: 1200, Pant: 1800, Suit: 8500, Kurta: 1500, 'Salwar Suit': 4500, Blouse: 800, Dress: 3500, Coat: 5000, Sherwani: 12000, Lehenga: 15000 } });
}

// ── Router ────────────────────────────────────────────────
const routes = {};
let currentRoute = null;
let routeHistory = [];

function register(name, fn) { routes[name] = fn; }

function navigate(route, params = {}, addHistory = true) {
  if (addHistory && currentRoute) routeHistory.push(currentRoute);
  currentRoute = { route, params };
  const content = document.getElementById('content');
  content.innerHTML = '';
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');
  const backBtn = document.getElementById('back-btn');
  const searchBtn = document.getElementById('search-btn');
  const notifBtn = document.getElementById('notif-btn');
  subtitle.classList.add('hidden');
  subtitle.textContent = '';
  const topLevelRoutes = ['dashboard', 'customers', 'orders', 'more'];
  if (topLevelRoutes.includes(route) || routeHistory.length === 0) {
    backBtn.classList.add('hidden');
    routeHistory = [];
  } else {
    backBtn.classList.remove('hidden');
  }
  // hide search on non-list pages
  searchBtn.classList.toggle('hidden', !['customers','orders','catalog'].includes(route));
  updateNavActive(route);
  if (routes[route]) routes[route](params);
  else content.innerHTML = '<div class="empty-state"><p>Page not found</p></div>';
}

function goBack() {
  if (routeHistory.length > 0) {
    const prev = routeHistory.pop();
    navigate(prev.route, prev.params, false);
  } else {
    navigate('dashboard');
  }
}

function updateNavActive(route) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === route || (route === 'new-order' && el.dataset.page === 'new-order'));
  });
  const map = { dashboard: 'dashboard', customers: 'customers', orders: 'orders', more: 'more' };
  Object.keys(map).forEach(r => {
    if (route.startsWith(r)) {
      document.querySelectorAll('.nav-item').forEach(el => { if (el.dataset.page === r) el.classList.add('active'); });
    }
  });
}

// ── Toast ─────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  document.getElementById('toast-container').prepend(el);
  setTimeout(() => { el.classList.add('fade-out'); setTimeout(() => el.remove(), 280); }, duration);
}

// ── Modal ─────────────────────────────────────────────────
function openModal(html, opts = {}) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (opts.center) overlay.classList.add('center-modal');
  else overlay.classList.remove('center-modal');
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-content').innerHTML = '';
}
function openFullModal(html) {
  const overlay = document.getElementById('fullmodal-overlay');
  const content = document.getElementById('fullmodal-content');
  content.innerHTML = html;
  overlay.classList.remove('hidden');
}
function closeFullModal() {
  document.getElementById('fullmodal-overlay').classList.add('hidden');
  document.getElementById('fullmodal-content').innerHTML = '';
}

// ── Shared Helpers ────────────────────────────────────────
function statusBadge(s) {
  return `<span class="badge badge-${s.toLowerCase()}">${s}</span>`;
}
function getCustomer(id) { return DB.get('customers').find(c => c.id === id); }
function getOrder(id) { return DB.get('orders').find(o => o.id === id); }

function confirmDialog(msg, onYes) {
  openModal(`
    <div class="modal-header"><span class="modal-title">Confirm</span><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body"><p style="font-size:15px;color:var(--text-secondary)">${msg}</p></div>
    <div class="modal-footer">
      <button class="btn btn-danger" onclick="(${onYes.toString()})();closeModal()">Yes, Delete</button>
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
    </div>`, { center: true });
}

// ── DASHBOARD ─────────────────────────────────────────────
register('dashboard', () => {
  const settings = DB.getObj('settings', {});
  const orders = DB.get('orders');
  const customers = DB.get('customers');
  const appts = DB.get('appointments');
  document.getElementById('page-title').textContent = settings.shopName || 'TailorPro';

  const active = orders.filter(o => !['delivered','cancelled'].includes(o.status)).length;
  const ready = orders.filter(o => o.status === 'ready').length;
  const todayAppts = appts.filter(a => a.date === today()).length;
  const monthRevenue = orders.filter(o => o.status === 'delivered' && o.createdAt && o.createdAt.startsWith('2026-06')).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const urgent = orders.filter(o => { const d = daysLeft(o.deadline); return d !== null && d <= 3 && !['delivered','cancelled'].includes(o.status); });

  const recentOrders = [...orders].sort((a,b) => (b.createdAt||'') > (a.createdAt||'') ? 1 : -1).slice(0, 5);

  const qaItems = [
    { label: 'New Order', icon: '📋', color: '#e8f4fd', iconColor: '#3498db', page: 'new-order' },
    { label: 'Customer', icon: '👤', color: '#fef9e7', iconColor: '#f39c12', page: 'new-customer' },
    { label: 'Measure', icon: '📐', color: '#e8f8f5', iconColor: '#1abc9c', page: 'measurements' },
    { label: 'Invoice', icon: '🧾', color: '#fdf2f8', iconColor: '#9b59b6', page: 'invoice-list' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="dashboard-hero">
        <div class="hero-greeting">Good day 👋</div>
        <div class="hero-name">${settings.shopName || 'TailorPro Studio'}</div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-val">${active}</div><div class="hero-stat-label">Active Orders</div></div>
          <div class="hero-stat"><div class="hero-stat-val">${ready}</div><div class="hero-stat-label">Ready</div></div>
          <div class="hero-stat"><div class="hero-stat-val">${todayAppts}</div><div class="hero-stat-label">Today's Appts</div></div>
        </div>
      </div>

      <div class="quick-actions">
        ${qaItems.map(q => `
          <button class="quick-action" onclick="navigate('${q.page}')">
            <div class="qa-icon" style="background:${q.color};color:${q.iconColor};font-size:20px">${q.icon}</div>
            <div class="qa-label">${q.label}</div>
          </button>`).join('')}
      </div>

      ${urgent.length ? `
      <div class="section-block" style="margin-top:16px">
        <div class="section-title">⚠ Urgent Deadlines</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${urgent.map(o => `
            <div class="card card-pad card-accent-danger" onclick="navigate('order-detail',{id:'${o.id}'})">
              <div class="flex items-center justify-between">
                <div><div style="font-size:14px;font-weight:700">${o.customerName}</div>
                <div style="font-size:12px;color:var(--text-muted)">${o.items.map(i=>i.type).join(', ')}</div></div>
                <div style="text-align:right">
                  <div style="font-size:12px;font-weight:700;color:var(--danger)">${daysLeft(o.deadline) <= 0 ? 'Overdue!' : daysLeft(o.deadline) + 'd left'}</div>
                  ${statusBadge(o.status)}
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      <div class="section-block" style="margin-top:${urgent.length ? 0 : 16}px">
        <div class="section-title">Recent Orders</div>
        <div class="card">
          ${recentOrders.length ? recentOrders.map(o => `
            <div class="activity-item" onclick="navigate('order-detail',{id:'${o.id}'})">
              <div class="activity-avatar">${initials(o.customerName)}</div>
              <div class="activity-info">
                <div class="activity-name">${o.customerName}</div>
                <div class="activity-desc">${o.items.map(i=>i.type).join(', ')} · ${o.orderNo}</div>
              </div>
              <div class="activity-meta">
                ${statusBadge(o.status)}
                <div class="activity-date">${fmtDateShort(o.createdAt)}</div>
              </div>
            </div>`).join('') : '<div class="empty-state" style="padding:24px"><p>No orders yet</p></div>'}
        </div>
      </div>

      <div class="section-block">
        <div class="section-title">Today's Appointments</div>
        <div class="card">
          ${appts.filter(a=>a.date===today()).length ? appts.filter(a=>a.date===today()).map(a => `
            <div class="activity-item" onclick="navigate('appointments')">
              <div class="activity-avatar" style="background:rgba(26,188,156,0.12);color:#1abc9c;font-size:12px;font-weight:800">${a.time}</div>
              <div class="activity-info">
                <div class="activity-name">${a.customerName}</div>
                <div class="activity-desc">${a.type}${a.notes ? ' · '+a.notes : ''}</div>
              </div>
              <div>${statusBadge(a.status)}</div>
            </div>`).join('') : '<div class="empty-state" style="padding:24px"><p>No appointments today</p></div>'}
        </div>
      </div>

      <div class="section-block">
        <div class="flex items-center justify-between" style="margin-bottom:10px">
          <span class="section-title" style="margin:0">Business Summary</span>
          <button onclick="navigate('reports')" style="font-size:12px;color:var(--accent-dark);font-weight:700">View Reports →</button>
        </div>
        <div class="grid-3" style="gap:10px">
          <div class="stat-card"><div class="stat-card-val">${customers.length}</div><div class="stat-card-label">Customers</div></div>
          <div class="stat-card"><div class="stat-card-val">${orders.length}</div><div class="stat-card-label">Total Orders</div></div>
          <div class="stat-card"><div class="stat-card-val">${fmt(monthRevenue)}</div><div class="stat-card-label">This Month</div></div>
        </div>
      </div>
    </div>`;
});

// ── CUSTOMERS ─────────────────────────────────────────────
register('customers', (params) => {
  document.getElementById('page-title').textContent = 'Customers';
  const customers = DB.get('customers');
  const q = params.q || '';

  const filtered = q ? customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)) : customers;

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" id="cust-search" placeholder="Search by name or phone…" value="${q}" oninput="navigate('customers',{q:this.value},false)">
        ${q ? `<button onclick="navigate('customers',{},false)" style="color:var(--text-muted);font-size:18px">✕</button>` : ''}
      </div>
      <div class="customer-list">
        ${filtered.length ? filtered.map(c => {
          const orders = DB.get('orders').filter(o => o.customerId === c.id);
          return `
            <div class="customer-card" onclick="navigate('customer-detail',{id:'${c.id}'})">
              <div class="customer-avatar">${initials(c.name)}</div>
              <div class="customer-info">
                <div class="customer-name">${c.name}</div>
                <div class="customer-phone">${c.phone}</div>
                <div class="customer-meta">${orders.length} order${orders.length!==1?'s':''} · ${c.measurements ? '📐 Measured' : '⚠ No measurements'}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>`;
        }).join('') : `<div class="empty-state">
          <div class="empty-icon">👤</div>
          <div class="empty-title">${q ? 'No results' : 'No customers yet'}</div>
          <div class="empty-desc">${q ? 'Try a different search' : 'Add your first customer to get started'}</div>
          ${!q ? `<button class="btn btn-accent btn-sm empty-btn" onclick="navigate('new-customer')">+ Add Customer</button>` : ''}
        </div>`}
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', '');
  // FAB
  let fab = document.querySelector('.fab');
  if (fab) fab.remove();
  fab = document.createElement('button');
  fab.className = 'fab';
  fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  fab.onclick = () => navigate('new-customer');
  document.getElementById('app').appendChild(fab);
});

// ── CUSTOMER DETAIL ───────────────────────────────────────
register('customer-detail', ({ id }) => {
  const c = getCustomer(id);
  if (!c) { navigate('customers'); return; }
  document.getElementById('page-title').textContent = c.name;
  const orders = DB.get('orders').filter(o => o.customerId === id);
  const m = c.measurements;

  const measureFields = [
    ['Chest', 'chest'], ['Waist', 'waist'], ['Hips', 'hips'], ['Shoulder', 'shoulder'],
    ['Sleeve', 'sleeveLength'], ['Inseam', 'inseam'], ['Neck', 'neck'], ['Back Length', 'backLength'],
    ['Thigh', 'thigh'], ['Front Length', 'frontLength'], ['Outseam', 'outseam'],
  ];

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="detail-hero">
        <div class="detail-hero-name">${c.name}</div>
        <div class="detail-hero-sub">${c.phone}${c.email ? ' · ' + c.email : ''}</div>
        ${c.notes ? `<div style="margin-top:8px;font-size:13px;color:rgba(255,255,255,0.6)">${c.notes}</div>` : ''}
        <div class="detail-hero-actions">
          <button class="detail-hero-btn" onclick="callCustomer('${c.phone}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </button>
          <button class="detail-hero-btn" onclick="waCustomer('${c.phone}','${c.name}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            WhatsApp
          </button>
          <button class="detail-hero-btn" onclick="navigate('edit-customer',{id:'${c.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="detail-hero-btn" onclick="navigate('measure-customer',{id:'${c.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><path d="M6 8l-4 4 4 4M18 8l4 4-4 4"/></svg>
            Measure
          </button>
        </div>
      </div>

      ${m ? `
      <div style="padding:0 16px;margin-top:14px">
        <div class="flex items-center justify-between" style="margin-bottom:8px">
          <span class="section-title" style="margin:0">Measurements (${m.unit||'in'})</span>
          <button onclick="navigate('measure-customer',{id:'${c.id}'})" style="font-size:12px;color:var(--accent-dark);font-weight:700">Update</button>
        </div>
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">
            ${measureFields.map(([label, key]) => `
              <div style="padding:10px 12px;border-bottom:1px solid var(--border-light);border-right:1px solid var(--border-light)">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700">${label}</div>
                <div style="font-size:16px;font-weight:800;color:var(--primary)">${m[key]||'—'}<span style="font-size:10px;font-weight:500;color:var(--text-muted)">${m[key]?' '+(m.unit||'in'):''}</span></div>
              </div>`).join('')}
          </div>
        </div>
      </div>` : `
      <div style="padding:14px 16px">
        <div class="card card-pad" style="text-align:center;border:2px dashed var(--border)">
          <div style="font-size:32px;margin-bottom:8px">📐</div>
          <div style="font-weight:700;margin-bottom:4px">No measurements recorded</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Take measurements by uploading a photo or entering manually</div>
          <button class="btn btn-accent" onclick="navigate('measure-customer',{id:'${c.id}'})">Take Measurements</button>
        </div>
      </div>`}

      <div style="padding:0 16px;margin-top:4px">
        <div class="flex items-center justify-between" style="margin-bottom:8px">
          <span class="section-title" style="margin:0">Orders (${orders.length})</span>
          <button onclick="navigate('new-order',{customerId:'${c.id}',customerName:'${c.name}'})" style="font-size:12px;color:var(--accent-dark);font-weight:700">+ New Order</button>
        </div>
        ${orders.length ? orders.map(o => `
          <div class="order-card" style="margin-bottom:10px" onclick="navigate('order-detail',{id:'${o.id}'})">
            <div class="order-card-top">
              <div>
                <div class="order-number">${o.orderNo}</div>
                <div class="order-items">${o.items.map(i=>i.type).join(', ')}</div>
              </div>
              ${statusBadge(o.status)}
            </div>
            <div class="order-card-bottom">
              <div class="order-deadline ${daysLeft(o.deadline)!==null && daysLeft(o.deadline)<=3 ? 'urgent' : ''}">Due ${fmtDateShort(o.deadline)}</div>
              <div class="order-amount">${fmt(o.totalAmount)}</div>
            </div>
          </div>`).join('') : '<div class="empty-state" style="padding:24px"><p>No orders yet</p></div>'}
      </div>

      <div style="padding:14px 16px 0">
        <button class="btn btn-danger" onclick="deleteCustomerConfirm('${c.id}')">Delete Customer</button>
      </div>
    </div>`;
});

window.callCustomer = (phone) => window.location.href = `tel:${phone}`;
window.waCustomer = (phone, name) => window.open(`https://wa.me/91${phone}?text=Hello ${encodeURIComponent(name)}, your order is ready at our store.`, '_blank');
window.deleteCustomerConfirm = (id) => {
  confirmDialog('Delete this customer? Their orders will remain.', () => {
    const list = DB.get('customers').filter(c => c.id !== id);
    DB.set('customers', list);
    toast('Customer deleted', 'success');
    navigate('customers');
  });
};

// ── NEW / EDIT CUSTOMER ───────────────────────────────────
register('new-customer', () => renderCustomerForm(null));
register('edit-customer', ({ id }) => renderCustomerForm(id));

function renderCustomerForm(id) {
  const c = id ? getCustomer(id) : null;
  document.getElementById('page-title').textContent = c ? 'Edit Customer' : 'New Customer';

  document.getElementById('content').innerHTML = `
    <div class="page page-pad">
      <div class="form-section-title">Customer Info</div>
      <div class="form-group">
        <label class="form-label">Full Name <span class="required">*</span></label>
        <input id="cf-name" class="form-input" placeholder="e.g. Arjun Sharma" value="${c?.name||''}">
      </div>
      <div class="form-group">
        <label class="form-label">Phone <span class="required">*</span></label>
        <input id="cf-phone" class="form-input" type="tel" placeholder="10-digit mobile" value="${c?.phone||''}">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input id="cf-email" class="form-input" type="email" placeholder="email@example.com" value="${c?.email||''}">
      </div>
      <div class="form-group">
        <label class="form-label">Address</label>
        <textarea id="cf-address" class="form-textarea" placeholder="Full address">${c?.address||''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea id="cf-notes" class="form-textarea" placeholder="Style preferences, notes…">${c?.notes||''}</textarea>
      </div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-accent" onclick="saveCustomer('${id||''}')">
          ${c ? 'Save Changes' : 'Add Customer'}
        </button>
        <button class="btn btn-outline" onclick="goBack()">Cancel</button>
      </div>
    </div>`;
}

window.saveCustomer = (id) => {
  const name = document.getElementById('cf-name').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  if (!name) { toast('Name is required', 'error'); return; }
  if (!phone || phone.length < 10) { toast('Valid phone required', 'error'); return; }

  const list = DB.get('customers');
  if (id) {
    const idx = list.findIndex(c => c.id === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], name, phone, email: document.getElementById('cf-email').value.trim(), address: document.getElementById('cf-address').value.trim(), notes: document.getElementById('cf-notes').value.trim() };
    }
    DB.set('customers', list);
    toast('Customer updated', 'success');
    navigate('customer-detail', { id });
  } else {
    const newC = { id: uid(), name, phone, email: document.getElementById('cf-email').value.trim(), address: document.getElementById('cf-address').value.trim(), notes: document.getElementById('cf-notes').value.trim(), measurements: null, createdAt: today() };
    list.push(newC);
    DB.set('customers', list);
    toast('Customer added!', 'success');
    navigate('customer-detail', { id: newC.id });
  }
};

// ── MEASUREMENTS ──────────────────────────────────────────
register('measurements', () => renderMeasurePage(null));
register('measure-customer', ({ id }) => renderMeasurePage(id));

function renderMeasurePage(customerId) {
  document.getElementById('page-title').textContent = 'Measurements';
  const c = customerId ? getCustomer(customerId) : null;
  const m = c?.measurements || {};

  const fields = [
    { key: 'chest', label: 'Chest', guide: 'Fullest part of chest, arms down' },
    { key: 'waist', label: 'Waist', guide: 'Narrowest part of torso' },
    { key: 'hips', label: 'Hips', guide: 'Fullest part of hips/seat' },
    { key: 'shoulder', label: 'Shoulder Width', guide: 'Seam to seam across back' },
    { key: 'sleeveLength', label: 'Sleeve Length', guide: 'Shoulder to wrist bone' },
    { key: 'neck', label: 'Neck', guide: 'Around base of neck + ½"' },
    { key: 'backLength', label: 'Back Length', guide: 'Nape of neck to waist' },
    { key: 'frontLength', label: 'Front Length', guide: 'Shoulder to desired length' },
    { key: 'inseam', label: 'Inseam', guide: 'Crotch to ankle (inner leg)' },
    { key: 'outseam', label: 'Outseam', guide: 'Waist to ankle (outer leg)' },
    { key: 'thigh', label: 'Thigh', guide: 'Fullest part of upper thigh' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="page">
      ${c ? `<div style="background:var(--primary);padding:14px 16px;display:flex;align-items:center;gap:12px;color:white">
        <div class="activity-avatar">${initials(c.name)}</div>
        <div><div style="font-weight:700">${c.name}</div><div style="font-size:12px;color:rgba(255,255,255,0.6)">${c.phone}</div></div>
      </div>` : ''}

      <!-- Photo Guide -->
      <div class="photo-guide-container">
        <div class="photo-guide-header">
          <h2>📷 Photo-Guided Measurement</h2>
          <p>Upload clear photos for accurate measurements. Follow the instructions carefully.</p>
        </div>

        <!-- Instructions -->
        <div class="photo-steps">
          <div class="photo-step">
            <div class="photo-step-header">
              <div class="step-number">1</div>
              <div class="step-title">Prepare for the Photo</div>
            </div>
            <ul class="photo-requirements">
              <li><span class="req-icon">✓</span> Wear fitted/tight clothing (no loose clothes)</li>
              <li><span class="req-icon">✓</span> Stand against a plain, light-coloured wall</li>
              <li><span class="req-icon">✓</span> Ensure bright, even lighting – no harsh shadows</li>
              <li><span class="req-icon">✓</span> Remove shoes and jewellery</li>
              <li><span class="req-icon warn">⚠</span> Do NOT suck in or puff out – stand naturally</li>
              <li><span class="req-icon warn">⚠</span> Have someone else take the photo if possible</li>
            </ul>
          </div>

          <div class="photo-step">
            <div class="photo-step-header">
              <div class="step-number">2</div>
              <div class="step-title">Front View Photo</div>
            </div>
            <div class="photo-guide-pose">
              <div class="pose-diagram">
                <svg class="pose-svg" width="60" height="120" viewBox="0 0 60 120">
                  <circle cx="30" cy="12" r="9" fill="none" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="21" x2="30" y2="70" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="32" x2="10" y2="55" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="32" x2="50" y2="55" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="70" x2="18" y2="105" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="70" x2="42" y2="105" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="10" y1="55" x2="8" y2="72" stroke="var(--accent)" stroke-width="1.5"/>
                  <line x1="50" y1="55" x2="52" y2="72" stroke="var(--accent)" stroke-width="1.5"/>
                  <!-- chest line -->
                  <line x1="14" y1="34" x2="46" y2="34" stroke="#e74c3c" stroke-width="1" stroke-dasharray="3,2"/>
                  <!-- waist line -->
                  <line x1="18" y1="52" x2="42" y2="52" stroke="#3498db" stroke-width="1" stroke-dasharray="3,2"/>
                  <!-- hip line -->
                  <line x1="15" y1="65" x2="45" y2="65" stroke="#2ecc71" stroke-width="1" stroke-dasharray="3,2"/>
                </svg>
                <div class="pose-label">Face camera<br>Arms slightly out</div>
              </div>
              <div style="flex:2;font-size:12px;color:var(--text-secondary)">
                <div style="margin-bottom:8px"><strong>Position:</strong> Face the camera directly</div>
                <div style="margin-bottom:8px"><strong>Arms:</strong> Slightly away from body (30° angle)</div>
                <div style="margin-bottom:8px"><strong>Feet:</strong> Shoulder-width apart</div>
                <div style="margin-bottom:8px"><strong>Camera height:</strong> At chest/waist level</div>
                <div><strong>Frame:</strong> Full body head to toe visible</div>
              </div>
            </div>
            <div class="photo-upload-zone" id="front-zone" onclick="document.getElementById('front-input').click()">
              <input type="file" id="front-input" accept="image/*" capture="environment" style="display:none" onchange="previewPhoto('front',this)">
              <div id="front-preview-wrap">
                <div class="upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div class="upload-title">Tap to upload Front Photo</div>
                <div class="upload-hint">Or tap to open camera · JPG, PNG</div>
              </div>
            </div>
          </div>

          <div class="photo-step">
            <div class="photo-step-header">
              <div class="step-number">3</div>
              <div class="step-title">Side View Photo (Right Side)</div>
            </div>
            <div class="photo-guide-pose">
              <div class="pose-diagram">
                <svg class="pose-svg" width="60" height="120" viewBox="0 0 60 120">
                  <circle cx="30" cy="12" r="9" fill="none" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="21" x2="30" y2="70" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="32" x2="18" y2="55" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="32" x2="38" y2="52" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="70" x2="25" y2="105" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="30" y1="70" x2="35" y2="105" stroke="var(--accent)" stroke-width="2"/>
                  <line x1="18" y1="55" x2="16" y2="72" stroke="var(--accent)" stroke-width="1.5"/>
                </svg>
                <div class="pose-label">Right side<br>Arms at sides</div>
              </div>
              <div style="flex:2;font-size:12px;color:var(--text-secondary)">
                <div style="margin-bottom:8px"><strong>Position:</strong> Turn right side to camera</div>
                <div style="margin-bottom:8px"><strong>Arms:</strong> Relaxed at sides</div>
                <div style="margin-bottom:8px"><strong>Head:</strong> Look straight ahead</div>
                <div><strong>Frame:</strong> Full body visible</div>
              </div>
            </div>
            <div class="photo-upload-zone" id="side-zone" onclick="document.getElementById('side-input').click()">
              <input type="file" id="side-input" accept="image/*" capture="environment" style="display:none" onchange="previewPhoto('side',this)">
              <div id="side-preview-wrap">
                <div class="upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div class="upload-title">Tap to upload Side Photo</div>
                <div class="upload-hint">Or tap to open camera · JPG, PNG</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Measurement Form -->
        <div class="card card-pad" style="margin-bottom:16px">
          <div class="form-section-title">Enter Measurements</div>
          <div class="pull-quote">Use a soft measuring tape. Enter values in inches (default) or cm.</div>
          <div style="display:flex;gap:12px;margin-bottom:16px;margin-top:10px">
            <label style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600">
              <input type="radio" name="munit" value="in" ${(m.unit||'in')==='in'?'checked':''} onchange="document.getElementById('unit-label').textContent='in'"> Inches
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600">
              <input type="radio" name="munit" value="cm" ${m.unit==='cm'?'checked':''} onchange="document.getElementById('unit-label').textContent='cm'"> Centimeters
            </label>
          </div>
          <div class="measurement-grid">
            ${fields.map(f => `
              <div class="measurement-field">
                <div class="mf-label">${f.label}</div>
                <div class="mf-input-wrap">
                  <input class="mf-input" id="mf-${f.key}" type="number" step="0.5" min="0" placeholder="0" value="${m[f.key]||''}">
                  <span class="mf-unit" id="unit-label">${m.unit||'in'}</span>
                </div>
                <div class="mf-guide">${f.guide}</div>
              </div>`).join('')}
          </div>
        </div>

        ${c ? `
        <button class="btn btn-accent" onclick="saveMeasurements('${c.id}')">Save Measurements</button>
        <button class="btn btn-outline" style="margin-top:8px" onclick="goBack()">Cancel</button>
        ` : `
        <div class="pull-quote">Select a customer first to save measurements.</div>
        <button class="btn btn-primary" onclick="navigate('customers')">← Go to Customers</button>`}
      </div>
    </div>`;
}

window.previewPhoto = (side, input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const zone = document.getElementById(`${side}-zone`);
    const wrap = document.getElementById(`${side}-preview-wrap`);
    zone.classList.add('has-photo');
    wrap.innerHTML = `<img class="upload-preview" src="${e.target.result}" alt="${side} view"><div style="font-size:13px;color:var(--success);font-weight:700">✓ ${side === 'front' ? 'Front' : 'Side'} photo uploaded</div><div style="font-size:12px;color:var(--text-muted);margin-top:4px">Tap to change</div>`;
    window[`${side}PhotoData`] = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.saveMeasurements = (customerId) => {
  const unit = document.querySelector('input[name="munit"]:checked')?.value || 'in';
  const keys = ['chest','waist','hips','shoulder','sleeveLength','neck','backLength','frontLength','inseam','outseam','thigh'];
  const m = { unit };
  keys.forEach(k => { const v = document.getElementById('mf-' + k)?.value; if (v) m[k] = parseFloat(v); });

  const list = DB.get('customers');
  const idx = list.findIndex(c => c.id === customerId);
  if (idx > -1) {
    list[idx].measurements = { ...m, frontPhoto: window.frontPhotoData || list[idx].measurements?.frontPhoto, sidePhoto: window.sidePhotoData || list[idx].measurements?.sidePhoto, lastUpdated: today() };
    DB.set('customers', list);
    toast('Measurements saved!', 'success');
    navigate('customer-detail', { id: customerId });
  }
};

// ── ORDERS ────────────────────────────────────────────────
register('orders', (params) => {
  document.getElementById('page-title').textContent = 'Orders';
  const orders = DB.get('orders');
  const filter = params?.filter || 'all';
  const q = params?.q || '';

  const statuses = ['all', 'pending', 'cutting', 'stitching', 'fitting', 'finishing', 'ready', 'delivered'];

  let filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  if (q) filtered = filtered.filter(o => o.customerName?.toLowerCase().includes(q.toLowerCase()) || o.orderNo?.includes(q));
  filtered = [...filtered].sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1);

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="status-filter scrollable-x">
        ${statuses.map(s => `<button class="filter-chip ${filter===s?'active':''}" onclick="navigate('orders',{filter:'${s}'},false)">${s==='all'?'All Orders':s.charAt(0).toUpperCase()+s.slice(1)} ${s==='all'?'('+orders.length+')':''}</button>`).join('')}
      </div>
      <div class="orders-list">
        ${filtered.length ? filtered.map(o => {
          const d = daysLeft(o.deadline);
          return `
            <div class="order-card" onclick="navigate('order-detail',{id:'${o.id}'})">
              <div class="order-card-top">
                <div>
                  <div class="order-number">${o.orderNo}</div>
                  <div class="order-customer">${o.customerName}</div>
                  <div class="order-items">${o.items?.map(i=>i.type).join(', ')}</div>
                </div>
                ${statusBadge(o.status)}
              </div>
              <div class="order-card-bottom">
                <div class="order-deadline ${d!==null&&d<=3&&!['delivered','cancelled'].includes(o.status)?'urgent':''}">
                  ${d === null ? '—' : d < 0 ? `Overdue ${Math.abs(d)}d` : d === 0 ? 'Due today!' : `Due in ${d}d · ${fmtDateShort(o.deadline)}`}
                </div>
                <div class="order-amount">${fmt(o.totalAmount)}</div>
              </div>
            </div>`;
        }).join('') : `<div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No orders</div>
          <div class="empty-desc">No orders match this filter</div>
        </div>`}
      </div>
    </div>`;

  let fab = document.querySelector('.fab');
  if (fab) fab.remove();
  fab = document.createElement('button');
  fab.className = 'fab';
  fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  fab.onclick = () => navigate('new-order');
  document.getElementById('app').appendChild(fab);
});

// ── ORDER DETAIL ──────────────────────────────────────────
register('order-detail', ({ id }) => {
  const o = getOrder(id);
  if (!o) { navigate('orders'); return; }
  document.getElementById('page-title').textContent = o.orderNo;

  const statusOrder = ['pending','cutting','stitching','fitting','finishing','ready','delivered'];
  const currIdx = statusOrder.indexOf(o.status);
  const balance = (o.totalAmount || 0) - (o.advance || 0);

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="detail-hero">
        <div class="order-number" style="color:var(--accent-light)">${o.orderNo}</div>
        <div class="detail-hero-name">${o.customerName}</div>
        <div style="margin-top:8px">${statusBadge(o.status)}</div>
        <div class="detail-hero-actions" style="margin-top:12px">
          <button class="detail-hero-btn" onclick="updateOrderStatus('${o.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Update Status
          </button>
          <button class="detail-hero-btn" onclick="navigate('invoice',{orderId:'${o.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Invoice
          </button>
          <button class="detail-hero-btn" onclick="navigate('edit-order',{id:'${o.id}'})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
      </div>

      <!-- Status Timeline -->
      <div style="padding:14px 16px 0">
        <div class="section-title">Progress</div>
        <div style="display:flex;align-items:center;gap:0;overflow-x:auto;padding-bottom:8px" class="scrollable-x">
          ${statusOrder.map((s, i) => `
            <div style="display:flex;align-items:center;flex-shrink:0">
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:56px">
                <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;
                  background:${i < currIdx ? 'var(--success)' : i === currIdx ? 'var(--accent)' : 'var(--border)'};
                  color:${i <= currIdx ? 'white' : 'var(--text-muted)'}">
                  ${i < currIdx ? '✓' : i + 1}
                </div>
                <div style="font-size:9px;font-weight:600;color:${i===currIdx?'var(--accent-dark)':i<currIdx?'var(--success)':'var(--text-muted)'};text-transform:capitalize;text-align:center">${s}</div>
              </div>
              ${i < statusOrder.length - 1 ? `<div style="height:2px;width:20px;background:${i<currIdx?'var(--success)':'var(--border)'};flex-shrink:0;margin-bottom:16px"></div>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <!-- Items -->
      <div style="margin:0 16px">
        <div class="section-title" style="margin-top:8px">Order Items</div>
        <div class="card">
          ${o.items?.map(item => `
            <div class="info-row">
              <div>
                <div style="font-size:14px;font-weight:700">${item.type}</div>
                <div style="font-size:12px;color:var(--text-muted)">${item.fabric||''} · Qty: ${item.qty||1}</div>
              </div>
              <div class="info-value">${fmt(item.price * (item.qty||1))}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Payment -->
      <div style="margin:12px 16px 0">
        <div class="section-title">Payment</div>
        <div class="card">
          <div class="info-row"><div class="info-label">Total Amount</div><div class="info-value" style="font-weight:800">${fmt(o.totalAmount)}</div></div>
          <div class="info-row"><div class="info-label">Advance Paid</div><div class="info-value" style="color:var(--success)">${fmt(o.advance)}</div></div>
          <div class="info-row" style="background:${balance>0?'rgba(231,76,60,0.04)':'rgba(46,204,113,0.04)'}">
            <div class="info-label" style="font-weight:700">Balance Due</div>
            <div class="info-value" style="font-weight:800;color:${balance>0?'var(--danger)':'var(--success)'}">${fmt(balance)}</div>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div style="margin:12px 16px 0">
        <div class="section-title">Details</div>
        <div class="card">
          <div class="info-row"><div class="info-label">Order Date</div><div class="info-value">${fmtDate(o.createdAt)}</div></div>
          <div class="info-row"><div class="info-label">Deadline</div><div class="info-value ${daysLeft(o.deadline)!==null&&daysLeft(o.deadline)<=3?'':''}"> ${fmtDate(o.deadline)}</div></div>
          ${o.notes ? `<div class="info-row"><div class="info-label">Notes</div><div class="info-value">${o.notes}</div></div>` : ''}
        </div>
      </div>

      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-whatsapp" onclick="whatsappOrder('${o.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.553 4.1 1.519 5.828L.057 23.888a.75.75 0 0 0 .916.932l6.218-1.635A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.5-5.244-1.378l-.374-.213-3.88 1.02 1.04-3.783-.232-.386A9.956 9.956 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
          Send WhatsApp Update
        </button>
        <button class="btn btn-danger" onclick="deleteOrderConfirm('${o.id}')">Delete Order</button>
      </div>
    </div>`;
});

window.updateOrderStatus = (id) => {
  const o = getOrder(id);
  const statuses = ['pending','cutting','stitching','fitting','finishing','ready','delivered','cancelled'];
  openModal(`
    <div class="modal-header"><span class="modal-title">Update Status</span><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body" style="padding:8px">
      ${statuses.map(s => `
        <button onclick="setOrderStatus('${id}','${s}')" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 16px;border-bottom:1px solid var(--border-light);background:${o.status===s?'rgba(201,169,110,0.1)':'transparent'}">
          <span style="font-size:15px;font-weight:600;text-transform:capitalize">${s}</span>
          ${o.status===s?'<span style="color:var(--accent-dark);font-weight:700">✓ Current</span>':''}
        </button>`).join('')}
    </div>`);
};

window.setOrderStatus = (id, status) => {
  const list = DB.get('orders');
  const idx = list.findIndex(o => o.id === id);
  if (idx > -1) { list[idx].status = status; list[idx].updatedAt = today(); DB.set('orders', list); }
  closeModal();
  toast(`Status updated to ${status}`, 'success');
  navigate('order-detail', { id });
};

window.whatsappOrder = (id) => {
  const o = getOrder(id);
  const c = getCustomer(o.customerId);
  if (!c) { toast('Customer not found', 'error'); return; }
  const msg = `Hello ${c.name}! 👋\nYour order *${o.orderNo}* update:\n\nItems: ${o.items.map(i=>i.type).join(', ')}\nStatus: *${o.status.toUpperCase()}*\nDeadline: ${fmtDate(o.deadline)}\nBalance Due: ${fmt((o.totalAmount||0)-(o.advance||0))}\n\nThank you! – ${DB.getObj('settings').shopName||'TailorPro'}`;
  window.open(`https://wa.me/91${c.phone}?text=${encodeURIComponent(msg)}`, '_blank');
};

window.deleteOrderConfirm = (id) => {
  confirmDialog('Delete this order permanently?', () => {
    DB.set('orders', DB.get('orders').filter(o => o.id !== id));
    toast('Order deleted', 'success');
    navigate('orders');
  });
};

// ── NEW / EDIT ORDER ──────────────────────────────────────
register('new-order', (params) => renderOrderForm(null, params));
register('edit-order', ({ id }) => renderOrderForm(id, {}));

function renderOrderForm(id, params = {}) {
  const o = id ? getOrder(id) : null;
  const settings = DB.getObj('settings', { prices: {} });
  document.getElementById('page-title').textContent = o ? 'Edit Order' : 'New Order';

  const garmentTypes = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Salwar Suit', 'Blouse', 'Dress', 'Coat', 'Sherwani', 'Lehenga', 'Jacket', 'Waistcoat', 'Other'];
  const customers = DB.get('customers');

  const items = o?.items || [{ type: 'Shirt', fabric: '', qty: 1, price: settings.prices?.Shirt || 1200 }];
  window._orderItems = [...items];

  document.getElementById('content').innerHTML = `
    <div class="page page-pad">
      <div class="form-section-title">Customer</div>
      <div class="form-group">
        <label class="form-label">Select Customer <span class="required">*</span></label>
        <select id="of-customer" class="form-select">
          <option value="">-- Select customer --</option>
          ${customers.map(c => `<option value="${c.id}|${c.name}" ${(o?.customerId===c.id||params.customerId===c.id)?'selected':''}>${c.name} – ${c.phone}</option>`).join('')}
        </select>
        <div class="form-hint">Or <button onclick="navigate('new-customer')" style="color:var(--accent-dark);font-weight:700;font-size:12px">add a new customer</button></div>
      </div>

      <div class="form-section-title" style="margin-top:4px">Order Items</div>
      <div id="items-container">
        ${items.map((item, i) => renderItemRow(item, i, garmentTypes, settings.prices)).join('')}
      </div>
      <button onclick="addItemRow()" class="btn btn-outline btn-sm" style="margin-bottom:16px">+ Add Another Item</button>

      <div class="form-section-title">Payment & Schedule</div>
      <div class="form-group">
        <label class="form-label">Total Amount (₹) <span class="required">*</span></label>
        <input id="of-total" class="form-input" type="number" placeholder="0" value="${o?.totalAmount||''}" oninput="calcBalance()">
      </div>
      <div class="form-group">
        <label class="form-label">Advance Paid (₹)</label>
        <input id="of-advance" class="form-input" type="number" placeholder="0" value="${o?.advance||0}" oninput="calcBalance()">
      </div>
      <div id="balance-display" style="margin:-8px 0 16px;padding:10px 14px;border-radius:var(--radius-md);background:var(--surface-alt);font-size:14px;font-weight:700"></div>
      <div class="form-group">
        <label class="form-label">Deadline <span class="required">*</span></label>
        <input id="of-deadline" class="form-input" type="date" value="${o?.deadline||''}">
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea id="of-notes" class="form-textarea" placeholder="Special instructions, occasion…">${o?.notes||''}</textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
        <button class="btn btn-accent" onclick="saveOrder('${id||''}')">
          ${o ? 'Save Changes' : 'Create Order'}
        </button>
        <button class="btn btn-outline" onclick="goBack()">Cancel</button>
      </div>
    </div>`;

  calcBalance();
  if (params.customerId) {
    const sel = document.getElementById('of-customer');
    for (let opt of sel.options) { if (opt.value.startsWith(params.customerId)) { sel.value = opt.value; break; } }
  }
}

function renderItemRow(item, i, types, prices) {
  return `<div class="card card-pad" style="margin-bottom:10px" id="item-row-${i}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:13px;font-weight:700;color:var(--text-secondary)">Item ${i+1}</span>
      ${i>0?`<button onclick="removeItem(${i})" style="color:var(--danger);font-size:12px;font-weight:700">Remove</button>`:''}
    </div>
    <div class="form-group" style="margin-bottom:10px">
      <label class="form-label" style="font-size:11px">Garment Type</label>
      <select class="form-select item-type" data-i="${i}" onchange="autoPrice(${i})" style="padding:10px">
        ${(types||[]).map(t=>`<option value="${t}" ${item.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:11px">Fabric</label>
        <input class="form-input item-fabric" data-i="${i}" placeholder="e.g. Blue Silk" value="${item.fabric||''}" style="padding:10px">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:11px">Qty</label>
        <input class="form-input item-qty" data-i="${i}" type="number" min="1" value="${item.qty||1}" style="padding:10px" onchange="autoPrice(${i})">
      </div>
    </div>
    <div class="form-group" style="margin:10px 0 0">
      <label class="form-label" style="font-size:11px">Price (₹)</label>
      <input class="form-input item-price" data-i="${i}" type="number" value="${item.price||0}" style="padding:10px" oninput="autoTotalFromItems()">
    </div>
  </div>`;
}

window.addItemRow = () => {
  const settings = DB.getObj('settings', { prices: {} });
  const types = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Salwar Suit', 'Blouse', 'Dress', 'Coat', 'Sherwani', 'Lehenga', 'Jacket', 'Waistcoat', 'Other'];
  window._orderItems.push({ type: 'Shirt', fabric: '', qty: 1, price: settings.prices?.Shirt || 1200 });
  const i = window._orderItems.length - 1;
  document.getElementById('items-container').insertAdjacentHTML('beforeend', renderItemRow(window._orderItems[i], i, types, settings.prices));
  autoTotalFromItems();
};

window.removeItem = (i) => {
  document.getElementById(`item-row-${i}`).remove();
  window._orderItems.splice(i, 1);
  autoTotalFromItems();
};

window.autoPrice = (i) => {
  const settings = DB.getObj('settings', { prices: {} });
  const type = document.querySelectorAll('.item-type')[i]?.value;
  const qty = parseInt(document.querySelectorAll('.item-qty')[i]?.value) || 1;
  const basePrice = settings.prices?.[type] || 0;
  const priceEl = document.querySelectorAll('.item-price')[i];
  if (priceEl && basePrice) priceEl.value = basePrice * qty;
  autoTotalFromItems();
};

window.autoTotalFromItems = () => {
  let total = 0;
  document.querySelectorAll('.item-price').forEach(el => { total += parseFloat(el.value) || 0; });
  const totalEl = document.getElementById('of-total');
  if (totalEl) totalEl.value = total;
  calcBalance();
};

window.calcBalance = () => {
  const total = parseFloat(document.getElementById('of-total')?.value) || 0;
  const advance = parseFloat(document.getElementById('of-advance')?.value) || 0;
  const balance = total - advance;
  const el = document.getElementById('balance-display');
  if (el) el.innerHTML = `<span style="color:var(--text-muted)">Balance Due: </span><span style="color:${balance>0?'var(--danger)':'var(--success)'}">${fmt(balance)}</span>`;
};

window.saveOrder = (id) => {
  const custVal = document.getElementById('of-customer').value;
  if (!custVal) { toast('Select a customer', 'error'); return; }
  const [customerId, customerName] = custVal.split('|');
  const deadline = document.getElementById('of-deadline').value;
  if (!deadline) { toast('Set a deadline', 'error'); return; }
  const total = parseFloat(document.getElementById('of-total').value) || 0;

  const items = [];
  const types = document.querySelectorAll('.item-type');
  const fabrics = document.querySelectorAll('.item-fabric');
  const qtys = document.querySelectorAll('.item-qty');
  const prices = document.querySelectorAll('.item-price');
  for (let i = 0; i < types.length; i++) {
    items.push({ type: types[i].value, fabric: fabrics[i]?.value || '', qty: parseInt(qtys[i]?.value) || 1, price: parseFloat(prices[i]?.value) || 0 });
  }

  const list = DB.get('orders');
  const settings = DB.getObj('settings', { nextOrderNo: 1 });

  if (id) {
    const idx = list.findIndex(o => o.id === id);
    if (idx > -1) { list[idx] = { ...list[idx], customerId, customerName, items, deadline, totalAmount: total, advance: parseFloat(document.getElementById('of-advance').value) || 0, notes: document.getElementById('of-notes').value }; }
    DB.set('orders', list);
    toast('Order updated', 'success');
    navigate('order-detail', { id });
  } else {
    const newO = { id: uid(), orderNo: 'TP-' + String(settings.nextOrderNo || 1).padStart(3, '0'), customerId, customerName, items, status: 'pending', deadline, totalAmount: total, advance: parseFloat(document.getElementById('of-advance').value) || 0, notes: document.getElementById('of-notes').value.trim(), createdAt: today() };
    list.push(newO);
    DB.set('orders', list);
    settings.nextOrderNo = (settings.nextOrderNo || 1) + 1;
    DB.setObj('settings', settings);
    toast('Order created!', 'success');
    navigate('order-detail', { id: newO.id });
  }
};

// ── INVOICE ───────────────────────────────────────────────
register('invoice-list', () => {
  document.getElementById('page-title').textContent = 'Invoices';
  const orders = DB.get('orders');
  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="orders-list">
        ${orders.length ? orders.map(o => `
          <div class="order-card" onclick="navigate('invoice',{orderId:'${o.id}'})">
            <div class="order-card-top">
              <div>
                <div class="order-number">${o.orderNo}</div>
                <div class="order-customer">${o.customerName}</div>
              </div>
              ${statusBadge(o.status)}
            </div>
            <div class="order-card-bottom">
              <div class="order-deadline">${fmtDate(o.createdAt)}</div>
              <div class="order-amount">${fmt(o.totalAmount)}</div>
            </div>
          </div>`).join('') : '<div class="empty-state"><div class="empty-icon">🧾</div><div class="empty-title">No invoices</div></div>'}
      </div>
    </div>`;
});

register('invoice', ({ orderId }) => {
  const o = getOrder(orderId);
  if (!o) { navigate('invoice-list'); return; }
  const c = getCustomer(o.customerId);
  const settings = DB.getObj('settings', {});
  document.getElementById('page-title').textContent = 'Invoice';

  const balance = (o.totalAmount || 0) - (o.advance || 0);

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div style="padding:16px;display:flex;gap:10px">
        <button class="btn btn-primary" onclick="window.print()" style="flex:1">🖨 Print Invoice</button>
        <button class="btn btn-whatsapp" onclick="whatsappInvoice('${o.id}')" style="flex:1">📲 Share</button>
      </div>
      <div class="invoice-preview" id="invoice-print">
        <div class="invoice-header">
          <div class="invoice-shop-name">${settings.shopName || 'TailorPro Studio'}</div>
          <div class="invoice-shop-info">${settings.address || ''} · ${settings.phone || ''}</div>
          ${settings.gst ? `<div class="invoice-shop-info" style="margin-top:4px">GST: ${settings.gst}%</div>` : ''}
        </div>
        <div class="invoice-meta">
          <div class="invoice-meta-item"><div class="invoice-meta-label">Invoice No.</div><div class="invoice-meta-value">${o.orderNo}</div></div>
          <div class="invoice-meta-item"><div class="invoice-meta-label">Date</div><div class="invoice-meta-value">${fmtDate(today())}</div></div>
          <div class="invoice-meta-item"><div class="invoice-meta-label">Due Date</div><div class="invoice-meta-value">${fmtDate(o.deadline)}</div></div>
        </div>
        <div class="invoice-body">
          <div class="invoice-customer" style="margin-bottom:14px">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:4px">Bill To</div>
            <div style="font-size:16px;font-weight:800">${o.customerName}</div>
            ${c?.phone ? `<div style="font-size:13px;color:var(--text-muted)">${c.phone}</div>` : ''}
            ${c?.address ? `<div style="font-size:12px;color:var(--text-muted)">${c.address}</div>` : ''}
          </div>
          <table class="invoice-table">
            <thead><tr><th>Item</th><th>Fabric</th><th>Qty</th><th style="text-align:right">Price</th></tr></thead>
            <tbody>
              ${o.items?.map(item => `
                <tr>
                  <td style="font-weight:600">${item.type}</td>
                  <td style="color:var(--text-muted)">${item.fabric||'—'}</td>
                  <td>${item.qty||1}</td>
                  <td style="text-align:right;font-weight:700">${fmt(item.price*(item.qty||1))}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <div class="invoice-total">
            <div class="invoice-total-row"><span>Subtotal</span><span>${fmt(o.totalAmount)}</span></div>
            <div class="invoice-total-row"><span>Advance Paid</span><span style="color:var(--success)">− ${fmt(o.advance)}</span></div>
            ${settings.gst ? `<div class="invoice-total-row"><span>GST (${settings.gst}%)</span><span>${fmt(o.totalAmount * parseFloat(settings.gst) / 100)}</span></div>` : ''}
            <div class="invoice-total-row grand"><span>Balance Due</span><span>${fmt(balance)}</span></div>
          </div>
          ${o.notes ? `<div style="margin-top:12px;font-size:12px;color:var(--text-muted)"><strong>Notes:</strong> ${o.notes}</div>` : ''}
        </div>
        <div class="invoice-footer">
          Thank you for choosing ${settings.shopName || 'TailorPro Studio'}! 🙏<br>
          <span style="font-size:11px">Payment due within 7 days of delivery.</span>
        </div>
      </div>
    </div>`;
});

window.whatsappInvoice = (id) => {
  const o = getOrder(id);
  const c = getCustomer(o.customerId);
  const settings = DB.getObj('settings', {});
  const balance = (o.totalAmount||0) - (o.advance||0);
  const msg = `*Invoice ${o.orderNo}* – ${settings.shopName||'TailorPro'}\n\nDear ${c?.name||o.customerName},\n\nItems: ${o.items.map(i=>`${i.type} x${i.qty}`).join(', ')}\nTotal: ${fmt(o.totalAmount)}\nAdvance: ${fmt(o.advance)}\n*Balance Due: ${fmt(balance)}*\n\nDeadline: ${fmtDate(o.deadline)}\n\nThank you! 🙏`;
  window.open(`https://wa.me/91${c?.phone||''}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ── APPOINTMENTS ──────────────────────────────────────────
register('appointments', () => {
  document.getElementById('page-title').textContent = 'Appointments';
  const appts = DB.get('appointments').sort((a,b) => a.date > b.date ? 1 : a.date < b.date ? -1 : a.time > b.time ? 1 : -1);
  const grouped = {};
  appts.forEach(a => { if (!grouped[a.date]) grouped[a.date] = []; grouped[a.date].push(a); });

  const typeColors = { Measurement: '#3498db', Fitting: '#1abc9c', Delivery: '#2ecc71', Consultation: '#9b59b6', Other: '#e67e22' };

  document.getElementById('content').innerHTML = `
    <div class="page">
      ${Object.keys(grouped).length ? Object.keys(grouped).map(date => `
        <div class="appt-date-header">${date === today() ? '📅 Today' : fmtDate(date)}</div>
        ${grouped[date].map(a => `
          <div class="appt-item" onclick="editAppt('${a.id}')">
            <div class="appt-time-col">
              <div class="appt-time">${a.time}</div>
            </div>
            <div class="appt-divider"></div>
            <div class="appt-info">
              <div class="appt-customer">${a.customerName}</div>
              <div class="appt-type">${a.type}${a.notes?' · '+a.notes:''}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
              ${statusBadge(a.status)}
              <div class="appt-dot" style="background:${typeColors[a.type]||'#999'}"></div>
            </div>
          </div>`).join('')}`).join('') : `
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <div class="empty-title">No appointments</div>
          <div class="empty-desc">Schedule fittings, deliveries and consultations</div>
        </div>`}
    </div>`;

  let fab = document.querySelector('.fab');
  if (fab) fab.remove();
  fab = document.createElement('button');
  fab.className = 'fab';
  fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  fab.onclick = () => showApptForm(null);
  document.getElementById('app').appendChild(fab);
});

window.editAppt = (id) => {
  const a = DB.get('appointments').find(x => x.id === id);
  showApptForm(a);
};

window.showApptForm = (appt) => {
  const customers = DB.get('customers');
  const types = ['Measurement', 'Fitting', 'Delivery', 'Consultation', 'Other'];
  openModal(`
    <div class="modal-header">
      <span class="modal-title">${appt ? 'Edit' : 'New'} Appointment</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Customer</label>
        <select id="af-customer" class="form-select">
          <option value="">Select customer</option>
          ${customers.map(c => `<option value="${c.id}|${c.name}" ${appt?.customerId===c.id?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input id="af-date" class="form-input" type="date" value="${appt?.date||today()}">
        </div>
        <div class="form-group">
          <label class="form-label">Time</label>
          <input id="af-time" class="form-input" type="time" value="${appt?.time||'10:00'}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select id="af-type" class="form-select">
          ${types.map(t => `<option ${appt?.type===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes</label>
        <input id="af-notes" class="form-input" placeholder="Optional notes" value="${appt?.notes||''}">
      </div>
      ${appt ? `<div class="form-group"><label class="form-label">Status</label>
        <select id="af-status" class="form-select">
          <option ${appt.status==='scheduled'?'selected':''}>scheduled</option>
          <option ${appt.status==='completed'?'selected':''}>completed</option>
          <option ${appt.status==='cancelled'?'selected':''}>cancelled</option>
        </select></div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-accent" onclick="saveAppt('${appt?.id||''}')">Save Appointment</button>
      ${appt ? `<button class="btn btn-danger" onclick="deleteAppt('${appt.id}')">Delete</button>` : ''}
    </div>`);
};

window.saveAppt = (id) => {
  const custVal = document.getElementById('af-customer').value;
  if (!custVal) { toast('Select a customer', 'error'); return; }
  const [customerId, customerName] = custVal.split('|');
  const list = DB.get('appointments');
  const data = { customerId, customerName, date: document.getElementById('af-date').value, time: document.getElementById('af-time').value, type: document.getElementById('af-type').value, notes: document.getElementById('af-notes').value, status: document.getElementById('af-status')?.value || 'scheduled' };
  if (id) {
    const idx = list.findIndex(a => a.id === id);
    if (idx > -1) list[idx] = { ...list[idx], ...data };
  } else {
    list.push({ id: uid(), ...data });
  }
  DB.set('appointments', list);
  closeModal();
  toast('Appointment saved!', 'success');
  navigate('appointments');
};

window.deleteAppt = (id) => {
  DB.set('appointments', DB.get('appointments').filter(a => a.id !== id));
  closeModal();
  toast('Appointment deleted', 'success');
  navigate('appointments');
};

// ── CATALOG ───────────────────────────────────────────────
register('catalog', (params) => {
  document.getElementById('page-title').textContent = 'Catalog';
  const tab = params?.tab || 'fabrics';
  const fabrics = DB.get('fabrics');
  const settings = DB.getObj('settings', { prices: {} });

  const garments = Object.entries(settings.prices || {}).map(([name, price]) => ({ name, price }));

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="catalog-tabs scrollable-x">
        <button class="catalog-tab ${tab==='fabrics'?'active':''}" onclick="navigate('catalog',{tab:'fabrics'},false)">Fabrics</button>
        <button class="catalog-tab ${tab==='garments'?'active':''}" onclick="navigate('catalog',{tab:'garments'},false)">Price List</button>
      </div>

      ${tab === 'fabrics' ? `
        <div style="padding:12px 16px;display:flex;flex-direction:column;gap:10px">
          ${fabrics.map(f => `
            <div class="fabric-card">
              <div class="fabric-swatch" style="background:${f.color||'#ccc'}"></div>
              <div class="fabric-info">
                <div class="fabric-name">${f.name}</div>
                <div class="fabric-type">${f.type} · ${f.pattern}</div>
                <div class="fabric-meta">
                  <span class="fabric-tag">₹${f.pricePerMeter}/m</span>
                  <span class="fabric-tag ${f.stock<=5?'stock-low':'stock-ok'}">${f.stock} m ${f.stock<=5?'⚠ Low':'✓'}</span>
                </div>
              </div>
              <button onclick="editFabric('${f.id}')" style="color:var(--text-muted);padding:8px">✏</button>
            </div>`).join('')}
        </div>
        <div style="padding:0 16px 16px">
          <button class="btn btn-accent" onclick="showFabricForm(null)">+ Add Fabric</button>
        </div>` : `
        <div style="padding:12px 16px">
          <div class="pull-quote" style="margin-bottom:12px">Standard prices used for auto-filling new orders. Update as needed.</div>
          <div class="card">
            ${garments.map(g => `
              <div class="info-row">
                <div style="font-size:15px;font-weight:600">${g.name}</div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:15px;font-weight:800;color:var(--primary)">₹${g.price}</span>
                  <button onclick="editGarmentPrice('${g.name}',${g.price})" style="color:var(--accent-dark);font-size:12px;font-weight:700">Edit</button>
                </div>
              </div>`).join('')}
          </div>
          <button class="btn btn-outline" style="margin-top:12px" onclick="addGarmentType()">+ Add Garment Type</button>
        </div>`}
    </div>`;
});

window.editFabric = (id) => {
  const f = DB.get('fabrics').find(x => x.id === id);
  showFabricForm(f);
};

window.showFabricForm = (fabric) => {
  const types = ['Cotton', 'Silk', 'Wool', 'Linen', 'Chiffon', 'Georgette', 'Polyester', 'Satin', 'Velvet', 'Denim', 'Other'];
  openModal(`
    <div class="modal-header"><span class="modal-title">${fabric?'Edit':'Add'} Fabric</span><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Name</label><input id="ff-name" class="form-input" value="${fabric?.name||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label>
          <select id="ff-type" class="form-select">${types.map(t=>`<option ${fabric?.type===t?'selected':''}>${t}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Pattern</label>
          <input id="ff-pattern" class="form-input" placeholder="Solid, Striped…" value="${fabric?.pattern||'Solid'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Price/meter (₹)</label><input id="ff-price" class="form-input" type="number" value="${fabric?.pricePerMeter||''}"></div>
        <div class="form-group"><label class="form-label">Stock (meters)</label><input id="ff-stock" class="form-input" type="number" value="${fabric?.stock||''}"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-accent" onclick="saveFabric('${fabric?.id||''}')">Save</button>
      ${fabric ? `<button class="btn btn-danger" onclick="deleteFabric('${fabric.id}')">Delete</button>` : ''}
    </div>`);
};

window.saveFabric = (id) => {
  const data = { name: document.getElementById('ff-name').value, type: document.getElementById('ff-type').value, pattern: document.getElementById('ff-pattern').value, pricePerMeter: parseFloat(document.getElementById('ff-price').value)||0, stock: parseFloat(document.getElementById('ff-stock').value)||0 };
  const list = DB.get('fabrics');
  if (id) { const idx = list.findIndex(f=>f.id===id); if(idx>-1) list[idx]={...list[idx],...data}; }
  else list.push({ id: uid(), color: '#888', ...data });
  DB.set('fabrics', list);
  closeModal();
  toast('Fabric saved', 'success');
  navigate('catalog', { tab: 'fabrics' });
};

window.deleteFabric = (id) => {
  DB.set('fabrics', DB.get('fabrics').filter(f=>f.id!==id));
  closeModal();
  toast('Fabric deleted', 'success');
  navigate('catalog', { tab: 'fabrics' });
};

window.editGarmentPrice = (name, price) => {
  openModal(`
    <div class="modal-header"><span class="modal-title">Edit Price: ${name}</span><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Price (₹)</label><input id="gp-price" class="form-input" type="number" value="${price}"></div>
    </div>
    <div class="modal-footer"><button class="btn btn-accent" onclick="saveGarmentPrice('${name}')">Save</button></div>`,
    { center: true });
};

window.saveGarmentPrice = (name) => {
  const settings = DB.getObj('settings', { prices: {} });
  settings.prices[name] = parseFloat(document.getElementById('gp-price').value) || 0;
  DB.setObj('settings', settings);
  closeModal();
  toast('Price updated', 'success');
  navigate('catalog', { tab: 'garments' });
};

window.addGarmentType = () => {
  openModal(`
    <div class="modal-header"><span class="modal-title">Add Garment Type</span><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Name</label><input id="ng-name" class="form-input" placeholder="e.g. Jumpsuit"></div>
      <div class="form-group"><label class="form-label">Price (₹)</label><input id="ng-price" class="form-input" type="number" placeholder="0"></div>
    </div>
    <div class="modal-footer"><button class="btn btn-accent" onclick="saveNewGarmentType()">Add</button></div>`,
    { center: true });
};

window.saveNewGarmentType = () => {
  const name = document.getElementById('ng-name').value.trim();
  if (!name) { toast('Enter a name', 'error'); return; }
  const settings = DB.getObj('settings', { prices: {} });
  settings.prices[name] = parseFloat(document.getElementById('ng-price').value) || 0;
  DB.setObj('settings', settings);
  closeModal();
  toast('Garment type added', 'success');
  navigate('catalog', { tab: 'garments' });
};

// ── REPORTS ───────────────────────────────────────────────
register('reports', () => {
  document.getElementById('page-title').textContent = 'Reports';
  const orders = DB.get('orders');
  const customers = DB.get('customers');

  const totalRevenue = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.totalAmount||0),0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders ? Math.round(totalRevenue / orders.filter(o=>o.status==='delivered').length || 0) : 0;
  const pending = orders.filter(o=>o.status==='pending').length;
  const active = orders.filter(o=>!['delivered','cancelled'].includes(o.status)).length;

  // Monthly data (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const rev = orders.filter(o => o.createdAt?.startsWith(key)).reduce((s,o)=>s+(o.totalAmount||0),0);
    months.push({ label, rev });
  }
  const maxRev = Math.max(...months.map(m => m.rev)) || 1;

  // Top garment types
  const typeCounts = {};
  orders.forEach(o => o.items?.forEach(i => { typeCounts[i.type] = (typeCounts[i.type]||0) + (i.qty||1); }));
  const topTypes = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  document.getElementById('content').innerHTML = `
    <div class="page page-pad">
      <div class="grid-2" style="margin-bottom:14px">
        <div class="stat-card"><div class="stat-card-val">${fmt(totalRevenue)}</div><div class="stat-card-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-card-val">${totalOrders}</div><div class="stat-card-label">Total Orders</div></div>
        <div class="stat-card"><div class="stat-card-val">${customers.length}</div><div class="stat-card-label">Customers</div></div>
        <div class="stat-card"><div class="stat-card-val">${active}</div><div class="stat-card-label">Active Orders</div></div>
      </div>

      <div class="card card-pad" style="margin-bottom:14px">
        <div class="card-title" style="margin-bottom:14px">Monthly Revenue</div>
        <div class="chart-bars">
          ${months.map(m => `
            <div class="chart-bar-group">
              <div class="chart-bar-val">${m.rev > 0 ? '₹'+Math.round(m.rev/1000)+'k' : ''}</div>
              <div class="chart-bar" style="height:${Math.max(4, Math.round(m.rev/maxRev*80))}px"></div>
              <div class="chart-bar-label">${m.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card card-pad" style="margin-bottom:14px">
        <div class="card-title" style="margin-bottom:12px">Top Garment Types</div>
        ${topTypes.map(([type, count]) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="flex:1;font-size:14px;font-weight:600">${type}</div>
            <div style="width:120px;height:8px;background:var(--border-light);border-radius:99px;overflow:hidden">
              <div style="height:100%;width:${Math.round(count/topTypes[0][1]*100)}%;background:var(--accent);border-radius:99px"></div>
            </div>
            <div style="font-size:13px;font-weight:800;color:var(--primary);width:32px;text-align:right">${count}</div>
          </div>`).join('')}
      </div>

      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:12px">Order Status Breakdown</div>
        ${['pending','cutting','stitching','fitting','finishing','ready','delivered'].map(s => {
          const cnt = orders.filter(o=>o.status===s).length;
          const pct = totalOrders ? Math.round(cnt/totalOrders*100) : 0;
          return `<div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:13px;font-weight:600;text-transform:capitalize">${s}</span>
              <span style="font-size:13px;font-weight:800">${cnt} (${pct}%)</span>
            </div>
            <div style="height:6px;background:var(--border-light);border-radius:99px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:var(--status-${s});border-radius:99px"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
});

// ── SETTINGS ──────────────────────────────────────────────
register('settings', () => {
  document.getElementById('page-title').textContent = 'Settings';
  const s = DB.getObj('settings', {});

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="settings-profile">
        <div class="settings-avatar">${initials(s.shopName||'T')}</div>
        <div>
          <div class="settings-shop-name">${s.shopName||'Your Shop'}</div>
          <div class="settings-shop-phone">${s.phone||'Add phone number'}</div>
        </div>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <div class="form-section-title">Shop Information</div>
        <div class="form-group"><label class="form-label">Shop Name</label><input id="s-name" class="form-input" value="${s.shopName||''}"></div>
        <div class="form-group"><label class="form-label">Owner Name</label><input id="s-owner" class="form-input" value="${s.ownerName||''}"></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="s-phone" class="form-input" type="tel" value="${s.phone||''}"></div>
        <div class="form-group"><label class="form-label">Address</label><textarea id="s-address" class="form-textarea">${s.address||''}</textarea></div>
        <div class="form-group"><label class="form-label">GST (%)</label><input id="s-gst" class="form-input" type="number" value="${s.gst||''}" placeholder="e.g. 18"></div>
        <button class="btn btn-accent" onclick="saveSettings()">Save Settings</button>
        <div class="form-section-title" style="margin-top:8px">Data Management</div>
        <button class="btn btn-outline" onclick="exportData()">📤 Export Data (JSON)</button>
        <button class="btn btn-danger" onclick="confirmClearData()">🗑 Clear All Data</button>
      </div>
    </div>`;
});

window.saveSettings = () => {
  const s = DB.getObj('settings', {});
  s.shopName = document.getElementById('s-name').value.trim();
  s.ownerName = document.getElementById('s-owner').value.trim();
  s.phone = document.getElementById('s-phone').value.trim();
  s.address = document.getElementById('s-address').value.trim();
  s.gst = document.getElementById('s-gst').value.trim();
  DB.setObj('settings', s);
  toast('Settings saved!', 'success');
  navigate('settings');
};

window.exportData = () => {
  const data = { customers: DB.get('customers'), orders: DB.get('orders'), appointments: DB.get('appointments'), fabrics: DB.get('fabrics'), settings: DB.getObj('settings') };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tailorpro-backup.json'; a.click();
};

window.confirmClearData = () => {
  confirmDialog('Clear ALL data? This cannot be undone!', () => {
    ['customers','orders','appointments','fabrics'].forEach(k => DB.set(k, []));
    DB.setObj('settings', {});
    toast('All data cleared', 'warning');
    navigate('dashboard');
  });
};

// ── MORE PAGE ─────────────────────────────────────────────
register('more', () => {
  document.getElementById('page-title').textContent = 'More';
  const items = [
    { icon: '📐', color: '#e8f4fd', label: 'Measurements', desc: 'Photo-guided body measurements', page: 'measurements' },
    { icon: '📅', color: '#e8f8f5', label: 'Appointments', desc: 'Schedule fittings & deliveries', page: 'appointments' },
    { icon: '🧾', color: '#fdf2f8', label: 'Invoices', desc: 'Generate and share invoices', page: 'invoice-list' },
    { icon: '🧵', color: '#fef9e7', label: 'Catalog & Prices', desc: 'Fabrics and garment price list', page: 'catalog' },
    { icon: '📊', color: '#f0f4ff', label: 'Reports', desc: 'Revenue and order analytics', page: 'reports' },
    { icon: '⚙️', color: '#f5f5f5', label: 'Settings', desc: 'Shop info, GST, data backup', page: 'settings' },
  ];

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div style="padding:16px 16px 8px">
        <div style="background:linear-gradient(135deg,var(--primary-light),var(--primary));border-radius:var(--radius-lg);padding:16px;color:white;display:flex;align-items:center;gap:12px">
          <div style="font-size:32px">✂️</div>
          <div>
            <div style="font-size:14px;font-weight:800">${DB.getObj('settings').shopName||'TailorPro Studio'}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.65)">Tailoring Business Management</div>
          </div>
        </div>
      </div>
      ${items.map(item => `
        <div class="more-section">
          <div class="more-list">
            <div class="more-item" onclick="navigate('${item.page}')">
              <div class="more-icon" style="background:${item.color};font-size:20px">${item.icon}</div>
              <div class="more-item-info">
                <div class="more-item-title">${item.label}</div>
                <div class="more-item-desc">${item.desc}</div>
              </div>
              <svg class="more-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>`).join('')}
      <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:12px">TailorPro v1.0 · Made with ❤️ for tailors</div>
    </div>`;
  const fab = document.querySelector('.fab');
  if (fab) fab.remove();
});

// ── BOOT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedDemo();

  // Remove FAB on nav change
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      const f = document.querySelector('.fab');
      if (f) f.remove();
      navigate(p);
    });
  });

  document.getElementById('back-btn').addEventListener('click', goBack);

  // Modal close on handle swipe down (simple tap outside)
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Notifications badge
  const updateBadge = () => {
    const urgent = DB.get('orders').filter(o => { const d = daysLeft(o.deadline); return d !== null && d <= 2 && !['delivered','cancelled'].includes(o.status); }).length;
    const badge = document.getElementById('notif-badge');
    if (urgent > 0) { badge.textContent = urgent; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  };

  // Splash → App
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('splash').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      navigate('dashboard', {}, false);
      updateBadge();
    }, 500);
  }, 1800);
});
