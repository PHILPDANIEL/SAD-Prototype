// ============================================================
//  SUPER ADMIN BACKEND — Express + Node.js
//  File: super_admin_backend.js
//  Run: node super_admin_backend.js
//  Requires: npm install express bcryptjs jsonwebtoken cors express-rate-limit
// ============================================================

const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── RATE LIMITING ───────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { success: false, message: 'Rate limit exceeded.' }
});

app.use('/api/', apiLimiter);

// ─── IN-MEMORY MOCK DATA (replace with real DB in production) ─
let USERS = [
  { id: 1,  firstName: 'Super',    lastName: 'Admin',   email: 'superadmin@system.com', password: bcrypt.hashSync('Admin@1234', 10), role: 'super_admin', status: 'active',   lastLogin: null, createdAt: '2024-01-01' },
  { id: 2,  firstName: 'Maria',    lastName: 'Santos',  email: 'maria@gmail.com',        password: bcrypt.hashSync('User@1234', 10),  role: 'user',        status: 'active',   lastLogin: null, createdAt: '2025-03-12' },
  { id: 3,  firstName: 'Jose',     lastName: 'Bautista',email: 'jose@gmail.com',         password: bcrypt.hashSync('User@1234', 10),  role: 'user',        status: 'active',   lastLogin: null, createdAt: '2025-04-01' },
  { id: 4,  firstName: 'Juan',     lastName: 'Reyes',   email: 'juan@admin.com',         password: bcrypt.hashSync('Admin@1234', 10), role: 'admin',       status: 'active',   lastLogin: null, createdAt: '2025-02-10' },
  { id: 5,  firstName: 'Maria',    lastName: 'Cruz',    email: 'mcruz@admin.com',        password: bcrypt.hashSync('Admin@1234', 10), role: 'admin',       status: 'active',   lastLogin: null, createdAt: '2025-01-20' },
  { id: 6,  firstName: 'Kevin',    lastName: 'Dela Cruz',email:'kevin@admin.com',        password: bcrypt.hashSync('Admin@1234', 10), role: 'admin',       status: 'pending',  lastLogin: null, createdAt: '2026-04-08' },
];

let ADMINS = [
  { id: 4, userId: 4, permissions: ['products', 'orders'],          approvedBy: 1, approvedAt: '2025-02-10' },
  { id: 5, userId: 5, permissions: ['reports', 'users'],            approvedBy: 1, approvedAt: '2025-01-20' },
  { id: 6, userId: 6, permissions: [],                              approvedBy: null, approvedAt: null },
];

let PRODUCTS = [
  { id: 1, name: 'Lechon Belly (1kg)',  category: 'Lechon',   price: 850,  stock: 75, status: 'available',    sku: 'LB-001' },
  { id: 2, name: 'Grilled Prawns',      category: 'Seafood',  price: 450,  stock: 8,  status: 'low_stock',    sku: 'GP-014' },
  { id: 3, name: 'Leche Flan',          category: 'Desserts', price: 120,  stock: 0,  status: 'out_of_stock', sku: 'LF-022' },
  { id: 4, name: 'Crispy Pata',         category: 'Lechon',   price: 800,  stock: 40, status: 'available',    sku: 'CP-005' },
  { id: 5, name: 'Grilled Bangus',      category: 'Seafood',  price: 450,  stock: 25, status: 'available',    sku: 'GB-011' },
];

let ADDONS = [
  { id: 1, name: 'Extra Sauce', assignedTo: 'all',    price: 20,   enabled: true },
  { id: 2, name: 'Rice Add-on', assignedTo: 'Lechon', price: 40,   enabled: true },
  { id: 3, name: 'Extra Spicy', assignedTo: 'BBQ',    price: 0,    enabled: false },
];

let ORDERS = [
  { id: 2841, userId: 2, items: [{ productId: 1, qty: 1 }, { productId: 1, qty: 2 }], total: 930,    status: 'completed', createdAt: '2026-04-09T10:42:00', flagged: false },
  { id: 2840, userId: 3, items: [{ productId: 2, qty: 2 }],                           total: 900,    status: 'processing',createdAt: '2026-04-09T09:30:00', flagged: false },
  { id: 2839, userId: 99,items: [{ productId: 1, qty: 50 }],                          total: 42500,  status: 'pending',   createdAt: '2026-04-09T08:12:00', flagged: true  },
];

let ROLES = [
  { id: 1, name: 'super_admin', permissions: ['*'] },
  { id: 2, name: 'admin',       permissions: ['products', 'orders', 'reports', 'users'] },
  { id: 3, name: 'staff',       permissions: ['orders'] },
  { id: 4, name: 'user',        permissions: [] },
];

let AUDIT_LOGS = [
  { id: 1, userId: 1, action: 'LOGIN',           resource: 'auth',     detail: 'Super Admin logged in',                      ip: '192.168.0.1',  createdAt: new Date().toISOString() },
  { id: 2, userId: 4, action: 'PRODUCT_UPDATE',  resource: 'products', detail: 'Updated Lechon Belly price from ₱800 to ₱850', ip: '192.168.0.45', createdAt: new Date(Date.now()-840000).toISOString() },
  { id: 3, userId: 0, action: 'SECURITY_ALERT',  resource: 'security', detail: 'Brute force from IP 203.45.67.89',             ip: '203.45.67.89', createdAt: new Date(Date.now()-2700000).toISOString() },
];

let BLOCKED_IPS = ['203.45.67.89', '10.0.0.254'];
let SETTINGS = {
  siteName: 'FoodHub PH', tagline: 'Order Fresh, Eat Well',
  contactEmail: 'admin@foodhubph.com', taxRate: 12, serviceFee: 5,
  deliveryFee: 50, minOrderAmount: 100, theme: 'dark',
  acceptOnlinePayments: true, cashOnDelivery: true, maintenanceMode: false
};

let nextId = { users: 10, products: 10, addons: 10, orders: 3000, logs: 10 };

// ─── HELPERS ─────────────────────────────────────────────────
const respond    = (res, data, code = 200) => res.status(code).json(data);
const fail       = (res, msg, code = 400)  => res.status(code).json({ success: false, message: msg });
const ok         = (res, data, msg = 'OK') => res.json({ success: true, message: msg, data });

function addLog(userId, action, resource, detail, ip = '0.0.0.0') {
  AUDIT_LOGS.unshift({ id: nextId.logs++, userId, action, resource, detail, ip, createdAt: new Date().toISOString() });
  if (AUDIT_LOGS.length > 1000) AUDIT_LOGS.pop(); // cap at 1000
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 'Access denied. No token.', 401);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    fail(res, 'Invalid or expired token.', 401);
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') return fail(res, 'Super Admin only.', 403);
  next();
}

function requireAdmin(req, res, next) {
  if (!['admin', 'super_admin'].includes(req.user?.role)) return fail(res, 'Admin access required.', 403);
  next();
}

function checkPermission(perm) {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') return next();
    const admin = ADMINS.find(a => a.userId === req.user.id);
    if (!admin || (!admin.permissions.includes(perm) && !admin.permissions.includes('*'))) {
      return fail(res, `Permission denied: requires '${perm}'`, 403);
    }
    next();
  };
}

// ─── ROUTES ──────────────────────────────────────────────────

// ── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'Email and password required.');

  const ip = req.ip || req.connection.remoteAddress;
  if (BLOCKED_IPS.includes(ip)) return fail(res, 'Access denied. IP blocked.', 403);

  const user = USERS.find(u => u.email === email);
  if (!user) return fail(res, 'Invalid credentials.', 401);

  if (!['super_admin', 'admin'].includes(user.role)) return fail(res, 'Not authorized for admin panel.', 403);
  if (user.status === 'pending')  return fail(res, 'Account pending approval.', 403);
  if (user.status === 'inactive') return fail(res, 'Account is inactive.', 403);
  if (user.status === 'banned')   return fail(res, 'Account is banned.', 403);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    addLog(0, 'LOGIN_FAILED', 'auth', `Failed login for ${email}`, ip);
    return fail(res, 'Invalid credentials.', 401);
  }

  user.lastLogin = new Date().toISOString();
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  addLog(user.id, 'LOGIN', 'auth', `${user.firstName} ${user.lastName} logged in`, ip);

  ok(res, {
    token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
  }, 'Login successful');
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  addLog(req.user.id, 'LOGOUT', 'auth', 'User logged out');
  ok(res, null, 'Logged out successfully');
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = USERS.find(u => u.id === req.user.id);
  if (!user) return fail(res, 'User not found.', 404);
  const { password: _, ...safe } = user;
  ok(res, safe);
});

// ── DASHBOARD ─────────────────────────────────────────────────
app.get('/api/dashboard/stats', authenticate, requireAdmin, (req, res) => {
  const totalUsers    = USERS.filter(u => u.role === 'user').length;
  const totalAdmins   = USERS.filter(u => u.role === 'admin').length;
  const totalOrders   = ORDERS.length;
  const todayOrders   = ORDERS.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const revenueToday  = todayOrders.reduce((s, o) => s + o.total, 0);
  const revenueTotal  = ORDERS.reduce((s, o) => s + o.total, 0);
  const pendingOrders = ORDERS.filter(o => o.status === 'pending').length;
  const flaggedOrders = ORDERS.filter(o => o.flagged).length;

  ok(res, { totalUsers, totalAdmins, totalOrders, revenueToday, revenueTotal, pendingOrders, flaggedOrders });
});

// ── USERS ─────────────────────────────────────────────────────
app.get('/api/users', authenticate, requireAdmin, checkPermission('users'), (req, res) => {
  const { search = '', role = '', status = '', page = 1, limit = 10 } = req.query;
  let result = USERS.map(({ password: _, ...u }) => u);
  if (search)  result = result.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  if (role)    result = result.filter(u => u.role === role);
  if (status)  result = result.filter(u => u.status === status);
  const total  = result.length;
  const start  = (page - 1) * limit;
  const paged  = result.slice(start, start + Number(limit));
  ok(res, { users: paged, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/users/:id', authenticate, requireAdmin, checkPermission('users'), (req, res) => {
  const user = USERS.find(u => u.id === Number(req.params.id));
  if (!user) return fail(res, 'User not found.', 404);
  const { password: _, ...safe } = user;
  ok(res, safe);
});

app.post('/api/users', authenticate, requireAdmin, checkPermission('users'), async (req, res) => {
  const { firstName, lastName, email, password, role = 'user' } = req.body;
  if (!firstName || !lastName || !email || !password) return fail(res, 'All fields required.');
  if (USERS.find(u => u.email === email)) return fail(res, 'Email already in use.');
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: nextId.users++, firstName, lastName, email, password: hashed, role, status: 'active', lastLogin: null, createdAt: new Date().toISOString() };
  USERS.push(user);
  addLog(req.user.id, 'USER_CREATE', 'users', `Created user ${email}`);
  const { password: _, ...safe } = user;
  ok(res, safe, 'User created');
});

app.put('/api/users/:id', authenticate, requireAdmin, checkPermission('users'), async (req, res) => {
  const idx = USERS.findIndex(u => u.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'User not found.', 404);
  if (USERS[idx].role === 'super_admin' && req.user.role !== 'super_admin') return fail(res, 'Cannot edit Super Admin.', 403);
  const { firstName, lastName, email, role, status, password } = req.body;
  if (firstName) USERS[idx].firstName = firstName;
  if (lastName)  USERS[idx].lastName  = lastName;
  if (email)     USERS[idx].email     = email;
  if (role && req.user.role === 'super_admin') USERS[idx].role = role;
  if (status)    USERS[idx].status    = status;
  if (password)  USERS[idx].password  = await bcrypt.hash(password, 10);
  addLog(req.user.id, 'USER_UPDATE', 'users', `Updated user ID ${req.params.id}`);
  const { password: _, ...safe } = USERS[idx];
  ok(res, safe, 'User updated');
});

app.delete('/api/users/:id', authenticate, requireSuperAdmin, (req, res) => {
  const idx = USERS.findIndex(u => u.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'User not found.', 404);
  if (USERS[idx].id === req.user.id) return fail(res, 'Cannot delete yourself.');
  const removed = USERS.splice(idx, 1)[0];
  addLog(req.user.id, 'USER_DELETE', 'users', `Deleted user ${removed.email}`);
  ok(res, null, 'User deleted');
});

app.patch('/api/users/:id/status', authenticate, requireAdmin, checkPermission('users'), (req, res) => {
  const { status } = req.body;
  if (!['active','inactive','banned'].includes(status)) return fail(res, 'Invalid status.');
  const user = USERS.find(u => u.id === Number(req.params.id));
  if (!user) return fail(res, 'User not found.', 404);
  user.status = status;
  addLog(req.user.id, 'USER_STATUS', 'users', `Set user ${user.email} status to ${status}`);
  ok(res, { id: user.id, status }, 'Status updated');
});

app.patch('/api/users/:id/reset-password', authenticate, requireSuperAdmin, async (req, res) => {
  const user = USERS.find(u => u.id === Number(req.params.id));
  if (!user) return fail(res, 'User not found.', 404);
  const temp = Math.random().toString(36).slice(-8) + 'A1!';
  user.password = await bcrypt.hash(temp, 10);
  addLog(req.user.id, 'PASSWORD_RESET', 'users', `Reset password for ${user.email}`);
  ok(res, { tempPassword: temp }, 'Password reset. Share temp password securely.');
});

// ── ADMINS ────────────────────────────────────────────────────
app.get('/api/admins', authenticate, requireSuperAdmin, (req, res) => {
  const admins = ADMINS.map(a => {
    const user = USERS.find(u => u.id === a.userId);
    const { password: _, ...safe } = user || {};
    return { ...a, user: safe };
  });
  ok(res, admins);
});

app.patch('/api/admins/:id/approve', authenticate, requireSuperAdmin, (req, res) => {
  const user = USERS.find(u => u.id === Number(req.params.id) && u.role === 'admin');
  if (!user) return fail(res, 'Admin not found.', 404);
  user.status = 'active';
  const admin = ADMINS.find(a => a.userId === user.id);
  if (admin) { admin.approvedBy = req.user.id; admin.approvedAt = new Date().toISOString(); }
  addLog(req.user.id, 'ADMIN_APPROVE', 'admins', `Approved admin ${user.email}`);
  ok(res, null, 'Admin approved');
});

app.patch('/api/admins/:id/permissions', authenticate, requireSuperAdmin, (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return fail(res, 'Permissions must be an array.');
  const admin = ADMINS.find(a => a.userId === Number(req.params.id));
  if (!admin) return fail(res, 'Admin not found.', 404);
  admin.permissions = permissions;
  addLog(req.user.id, 'ADMIN_PERMS', 'admins', `Updated permissions for admin ID ${req.params.id}: ${permissions.join(', ')}`);
  ok(res, admin, 'Permissions updated');
});

app.delete('/api/admins/:id', authenticate, requireSuperAdmin, (req, res) => {
  const idx = ADMINS.findIndex(a => a.userId === Number(req.params.id));
  if (idx < 0) return fail(res, 'Admin not found.', 404);
  ADMINS.splice(idx, 1);
  const user = USERS.find(u => u.id === Number(req.params.id));
  if (user) user.role = 'user';
  addLog(req.user.id, 'ADMIN_DELETE', 'admins', `Removed admin ID ${req.params.id}`);
  ok(res, null, 'Admin removed');
});

// ── PRODUCTS ──────────────────────────────────────────────────
app.get('/api/products', authenticate, requireAdmin, (req, res) => {
  const { search = '', category = '', status = '' } = req.query;
  let result = [...PRODUCTS];
  if (search)   result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category) result = result.filter(p => p.category === category);
  if (status)   result = result.filter(p => p.status === status);
  ok(res, result);
});

app.post('/api/products', authenticate, requireAdmin, checkPermission('products'), (req, res) => {
  const { name, category, price, stock, sku } = req.body;
  if (!name || !category || price === undefined) return fail(res, 'name, category, price required.');
  const status = stock > 10 ? 'available' : stock > 0 ? 'low_stock' : 'out_of_stock';
  const product = { id: nextId.products++, name, category, price: Number(price), stock: Number(stock) || 0, status, sku: sku || '' };
  PRODUCTS.push(product);
  addLog(req.user.id, 'PRODUCT_CREATE', 'products', `Created product "${name}"`);
  ok(res, product, 'Product created');
});

app.put('/api/products/:id', authenticate, requireAdmin, checkPermission('products'), (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'Product not found.', 404);
  const before = { ...PRODUCTS[idx] };
  const { name, category, price, stock, sku } = req.body;
  if (name)     PRODUCTS[idx].name     = name;
  if (category) PRODUCTS[idx].category = category;
  if (price !== undefined) PRODUCTS[idx].price = Number(price);
  if (stock !== undefined) {
    PRODUCTS[idx].stock  = Number(stock);
    PRODUCTS[idx].status = stock > 10 ? 'available' : stock > 0 ? 'low_stock' : 'out_of_stock';
  }
  if (sku) PRODUCTS[idx].sku = sku;
  addLog(req.user.id, 'PRODUCT_UPDATE', 'products', `Updated "${before.name}" — price: ₱${before.price}→₱${PRODUCTS[idx].price}`);
  ok(res, PRODUCTS[idx], 'Product updated');
});

app.delete('/api/products/:id', authenticate, requireAdmin, checkPermission('products'), (req, res) => {
  const idx = PRODUCTS.findIndex(p => p.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'Product not found.', 404);
  const [removed] = PRODUCTS.splice(idx, 1);
  addLog(req.user.id, 'PRODUCT_DELETE', 'products', `Deleted product "${removed.name}"`);
  ok(res, null, 'Product deleted');
});

// ── ADD-ONS ───────────────────────────────────────────────────
app.get('/api/addons', authenticate, requireAdmin, (req, res) => ok(res, ADDONS));

app.post('/api/addons', authenticate, requireSuperAdmin, (req, res) => {
  const { name, assignedTo = 'all', price = 0 } = req.body;
  if (!name) return fail(res, 'Name required.');
  const addon = { id: nextId.addons++, name, assignedTo, price: Number(price), enabled: true };
  ADDONS.push(addon);
  addLog(req.user.id, 'ADDON_CREATE', 'addons', `Created add-on "${name}"`);
  ok(res, addon, 'Add-on created');
});

app.put('/api/addons/:id', authenticate, requireSuperAdmin, (req, res) => {
  const idx = ADDONS.findIndex(a => a.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'Add-on not found.', 404);
  const { name, assignedTo, price, enabled } = req.body;
  if (name !== undefined)       ADDONS[idx].name       = name;
  if (assignedTo !== undefined) ADDONS[idx].assignedTo = assignedTo;
  if (price !== undefined)      ADDONS[idx].price      = Number(price);
  if (enabled !== undefined)    ADDONS[idx].enabled    = Boolean(enabled);
  addLog(req.user.id, 'ADDON_UPDATE', 'addons', `Updated add-on "${ADDONS[idx].name}"`);
  ok(res, ADDONS[idx], 'Add-on updated');
});

app.delete('/api/addons/:id', authenticate, requireSuperAdmin, (req, res) => {
  const idx = ADDONS.findIndex(a => a.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'Add-on not found.', 404);
  const [removed] = ADDONS.splice(idx, 1);
  addLog(req.user.id, 'ADDON_DELETE', 'addons', `Deleted add-on "${removed.name}"`);
  ok(res, null, 'Add-on deleted');
});

// ── ORDERS ────────────────────────────────────────────────────
app.get('/api/orders', authenticate, requireAdmin, checkPermission('orders'), (req, res) => {
  const { status = '', flagged = '', page = 1, limit = 20 } = req.query;
  let result = [...ORDERS];
  if (status)  result = result.filter(o => o.status === status);
  if (flagged === 'true') result = result.filter(o => o.flagged);
  const total = result.length;
  const start = (page - 1) * limit;
  ok(res, { orders: result.slice(start, start + Number(limit)), total });
});

app.get('/api/orders/:id', authenticate, requireAdmin, checkPermission('orders'), (req, res) => {
  const order = ORDERS.find(o => o.id === Number(req.params.id));
  if (!order) return fail(res, 'Order not found.', 404);
  ok(res, order);
});

app.patch('/api/orders/:id/status', authenticate, requireAdmin, checkPermission('orders'), (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending','processing','completed','cancelled','refunded'];
  if (!validStatuses.includes(status)) return fail(res, 'Invalid status.');
  const order = ORDERS.find(o => o.id === Number(req.params.id));
  if (!order) return fail(res, 'Order not found.', 404);
  const prev = order.status;
  order.status = status;
  addLog(req.user.id, 'ORDER_STATUS', 'orders', `Order #${order.id} status: ${prev} → ${status}`);
  ok(res, order, 'Order status updated');
});

app.patch('/api/orders/:id/flag', authenticate, requireAdmin, checkPermission('orders'), (req, res) => {
  const order = ORDERS.find(o => o.id === Number(req.params.id));
  if (!order) return fail(res, 'Order not found.', 404);
  order.flagged = !order.flagged;
  addLog(req.user.id, 'ORDER_FLAG', 'orders', `Order #${order.id} flagged: ${order.flagged}`);
  ok(res, { id: order.id, flagged: order.flagged }, `Order ${order.flagged ? 'flagged' : 'unflagged'}`);
});

app.post('/api/orders/:id/force-cancel', authenticate, requireSuperAdmin, (req, res) => {
  const order = ORDERS.find(o => o.id === Number(req.params.id));
  if (!order) return fail(res, 'Order not found.', 404);
  order.status = 'cancelled';
  addLog(req.user.id, 'ORDER_FORCE_CANCEL', 'orders', `Force cancelled order #${order.id} (Super Admin)`);
  ok(res, order, 'Order force cancelled');
});

// ── REPORTS ───────────────────────────────────────────────────
app.get('/api/reports/sales', authenticate, requireAdmin, checkPermission('reports'), (req, res) => {
  const { period = 'daily' } = req.query;
  const completed = ORDERS.filter(o => o.status === 'completed');
  const totalRevenue   = completed.reduce((s, o) => s + o.total, 0);
  const totalOrders    = ORDERS.length;
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelledCount = ORDERS.filter(o => o.status === 'cancelled').length;
  ok(res, { period, totalRevenue, totalOrders, avgOrderValue, cancelledCount, completedOrders: completed.length });
});

app.get('/api/reports/top-products', authenticate, requireAdmin, checkPermission('reports'), (req, res) => {
  const sales = {};
  ORDERS.forEach(order => {
    order.items.forEach(item => {
      sales[item.productId] = (sales[item.productId] || 0) + item.qty;
    });
  });
  const top = Object.entries(sales)
    .map(([pid, qty]) => {
      const product = PRODUCTS.find(p => p.id === Number(pid));
      return { product: product?.name || 'Unknown', unitsSold: qty, revenue: qty * (product?.price || 0) };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);
  ok(res, top);
});

// ── ROLES ─────────────────────────────────────────────────────
app.get('/api/roles', authenticate, requireAdmin, (req, res) => ok(res, ROLES));

app.post('/api/roles', authenticate, requireSuperAdmin, (req, res) => {
  const { name, permissions = [] } = req.body;
  if (!name) return fail(res, 'Role name required.');
  if (ROLES.find(r => r.name === name)) return fail(res, 'Role already exists.');
  const role = { id: ROLES.length + 1, name, permissions };
  ROLES.push(role);
  addLog(req.user.id, 'ROLE_CREATE', 'roles', `Created role "${name}"`);
  ok(res, role, 'Role created');
});

app.put('/api/roles/:id', authenticate, requireSuperAdmin, (req, res) => {
  const role = ROLES.find(r => r.id === Number(req.params.id));
  if (!role) return fail(res, 'Role not found.', 404);
  const { name, permissions } = req.body;
  if (name)        role.name        = name;
  if (permissions) role.permissions = permissions;
  addLog(req.user.id, 'ROLE_UPDATE', 'roles', `Updated role "${role.name}"`);
  ok(res, role, 'Role updated');
});

app.delete('/api/roles/:id', authenticate, requireSuperAdmin, (req, res) => {
  const idx = ROLES.findIndex(r => r.id === Number(req.params.id));
  if (idx < 0) return fail(res, 'Role not found.', 404);
  if (['super_admin','admin','user'].includes(ROLES[idx].name)) return fail(res, 'Cannot delete system roles.');
  const [removed] = ROLES.splice(idx, 1);
  addLog(req.user.id, 'ROLE_DELETE', 'roles', `Deleted role "${removed.name}"`);
  ok(res, null, 'Role deleted');
});

// ── SETTINGS ──────────────────────────────────────────────────
app.get('/api/settings', authenticate, requireAdmin, (req, res) => ok(res, SETTINGS));

app.put('/api/settings', authenticate, requireSuperAdmin, (req, res) => {
  const allowed = ['siteName','tagline','contactEmail','taxRate','serviceFee','deliveryFee','minOrderAmount','theme','acceptOnlinePayments','cashOnDelivery','maintenanceMode'];
  allowed.forEach(key => { if (req.body[key] !== undefined) SETTINGS[key] = req.body[key]; });
  addLog(req.user.id, 'SETTINGS_UPDATE', 'settings', 'System settings updated');
  ok(res, SETTINGS, 'Settings saved');
});

// ── AUDIT LOGS ────────────────────────────────────────────────
app.get('/api/logs', authenticate, requireAdmin, (req, res) => {
  const { action = '', resource = '', userId = '', page = 1, limit = 50 } = req.query;
  let result = [...AUDIT_LOGS];
  if (action)   result = result.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  if (resource) result = result.filter(l => l.resource === resource);
  if (userId)   result = result.filter(l => l.userId === Number(userId));
  const total = result.length;
  const start = (page - 1) * limit;
  ok(res, { logs: result.slice(start, start + Number(limit)), total });
});

app.delete('/api/logs', authenticate, requireSuperAdmin, (req, res) => {
  const { olderThanDays = 30 } = req.body;
  const cutoff = new Date(Date.now() - olderThanDays * 86400000);
  const before = AUDIT_LOGS.length;
  AUDIT_LOGS.splice(0, AUDIT_LOGS.length, ...AUDIT_LOGS.filter(l => new Date(l.createdAt) > cutoff));
  addLog(req.user.id, 'LOGS_CLEAR', 'logs', `Cleared logs older than ${olderThanDays} days`);
  ok(res, { deleted: before - AUDIT_LOGS.length }, 'Logs cleared');
});

// ── SECURITY ──────────────────────────────────────────────────
app.get('/api/security/blocked-ips', authenticate, requireSuperAdmin, (req, res) => ok(res, BLOCKED_IPS));

app.post('/api/security/block-ip', authenticate, requireSuperAdmin, (req, res) => {
  const { ip } = req.body;
  if (!ip) return fail(res, 'IP required.');
  if (BLOCKED_IPS.includes(ip)) return fail(res, 'IP already blocked.');
  BLOCKED_IPS.push(ip);
  addLog(req.user.id, 'IP_BLOCK', 'security', `Blocked IP ${ip}`);
  ok(res, BLOCKED_IPS, `IP ${ip} blocked`);
});

app.delete('/api/security/block-ip', authenticate, requireSuperAdmin, (req, res) => {
  const { ip } = req.body;
  const idx = BLOCKED_IPS.indexOf(ip);
  if (idx < 0) return fail(res, 'IP not in blocklist.', 404);
  BLOCKED_IPS.splice(idx, 1);
  addLog(req.user.id, 'IP_UNBLOCK', 'security', `Unblocked IP ${ip}`);
  ok(res, BLOCKED_IPS, `IP ${ip} unblocked`);
});

app.post('/api/security/force-logout', authenticate, requireSuperAdmin, (req, res) => {
  addLog(req.user.id, 'FORCE_LOGOUT', 'security', 'Force logout issued for all users');
  // In production: invalidate all tokens via a token blacklist / Redis
  ok(res, null, 'Force logout issued. All sessions will be invalidated on next request.');
});

app.post('/api/security/lockdown', authenticate, requireSuperAdmin, (req, res) => {
  const { reason } = req.body;
  SETTINGS.maintenanceMode = true;
  addLog(req.user.id, 'EMERGENCY_LOCKDOWN', 'security', `LOCKDOWN: ${reason || 'No reason provided'}`);
  ok(res, null, 'Emergency lockdown activated');
});

// ── MAINTENANCE ───────────────────────────────────────────────
app.get('/api/maintenance/health', authenticate, requireAdmin, (req, res) => {
  ok(res, {
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    memory: {
      used:  Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    users:    USERS.length,
    products: PRODUCTS.length,
    orders:   ORDERS.length,
    logs:     AUDIT_LOGS.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/maintenance/backup', authenticate, requireSuperAdmin, (req, res) => {
  addLog(req.user.id, 'BACKUP', 'maintenance', 'Database backup initiated');
  // In production: trigger real backup process (e.g., mysqldump / pg_dump)
  ok(res, { filename: `backup_${new Date().toISOString().slice(0,10)}_${Date.now()}.sql` }, 'Backup started');
});

app.post('/api/maintenance/maintenance-mode', authenticate, requireSuperAdmin, (req, res) => {
  const { enabled } = req.body;
  SETTINGS.maintenanceMode = Boolean(enabled);
  addLog(req.user.id, 'MAINTENANCE_MODE', 'maintenance', `Maintenance mode: ${enabled}`);
  ok(res, { maintenanceMode: SETTINGS.maintenanceMode }, `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
});

// ── FEEDBACK ──────────────────────────────────────────────────
let FEEDBACK = [
  { id: 1, userId: 2, type: 'complaint',   message: 'Order arrived cold and late...', rating: 2, status: 'pending',  createdAt: '2026-04-09' },
  { id: 2, userId: 3, type: 'praise',      message: "Best lechon I've ever had!",     rating: 5, status: 'resolved', createdAt: '2026-04-08' },
  { id: 3, userId: 0, type: 'suggestion',  message: 'Please add GCash payment...',    rating: 4, status: 'pending',  createdAt: '2026-04-07' },
];

app.get('/api/feedback', authenticate, requireAdmin, (req, res) => {
  const { type = '', status = '' } = req.query;
  let result = [...FEEDBACK];
  if (type)   result = result.filter(f => f.type === type);
  if (status) result = result.filter(f => f.status === status);
  ok(res, result);
});

app.patch('/api/feedback/:id/resolve', authenticate, requireAdmin, (req, res) => {
  const item = FEEDBACK.find(f => f.id === Number(req.params.id));
  if (!item) return fail(res, 'Feedback not found.', 404);
  item.status = 'resolved';
  ok(res, item, 'Feedback resolved');
});

// ─── 404 & ERROR HANDLER ────────────────────────────────────
app.use((req, res) => fail(res, `Route ${req.method} ${req.path} not found.`, 404));
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  fail(res, 'Internal server error.', 500);
});

// ─── START ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Super Admin Backend running on http://localhost:${PORT}`);
  console.log(`\n📋 Default Login Credentials:`);
  console.log(`   Super Admin: superadmin@system.com / Admin@1234`);
  console.log(`   Admin:       juan@admin.com / Admin@1234`);
  console.log(`\n📡 Key Endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/dashboard/stats`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/admins`);
  console.log(`   GET  /api/products`);
  console.log(`   GET  /api/orders`);
  console.log(`   GET  /api/logs`);
  console.log(`   GET  /api/maintenance/health`);
});

module.exports = app;