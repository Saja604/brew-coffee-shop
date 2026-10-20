const express = require('express');
const path = require('path');
const menu = require('./public/menu.json'); // loaded once when the server starts

const app = express();

// ---------- Middleware ----------

// Our own middleware: log every API request, then pass control on with next()
function logger(req, res, next) {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', logger);      // only API requests, so images and CSS don't flood the console
app.use(express.json());      // reads JSON request bodies into req.body

// ---------- Menu routes (Part 1) ----------

// GET /api/menu                      -> all items
// GET /api/menu?category=Coffee      -> only one category
// GET /api/menu?sort=sold&limit=7    -> best sellers (most sold first, first 7)
// GET /api/menu?search=latte         -> items whose name contains "latte"
app.get('/api/menu', (req, res) => {
  let result = [...menu];
  const { category, search, sort, limit } = req.query;

  if (category) {
    result = result.filter(item => item.category === category);
  }
  if (search) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (sort === 'sold') {
    result.sort((a, b) => b.sold - a.sold);
  }
  if (limit) {
    result = result.slice(0, Number(limit));
  }

  res.json(result);
});

// GET /api/menu/3 -> one item
app.get('/api/menu/:id', (req, res) => {
  const id = Number(req.params.id); // params are always strings
  const item = menu.find(menuItem => menuItem.id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
});

// ---------- Order routes (Part 2) ----------

const DELIVERY_FEE_CENTS = 400;
let orders = [];     // lives in memory: it resets every time the server restarts (a database fixes this in Part 3)
let nextOrderId = 1;

function isValidAddress(address) {
  return typeof address === 'string' && address.trim() !== '' && address.length <= 200;
}

// Middleware that only runs on routes where we list it.
// If something is wrong it answers with 400 and stops; otherwise next() runs the real handler.
function validateOrder(req, res, next) {
  const { items, address } = req.body ?? {};

  if (!isValidAddress(address)) {
    return res.status(400).json({ message: 'Please enter a valid address' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'The order must contain at least one item' });
  }
  for (const line of items) {
    if (!menu.some(menuItem => menuItem.id === line?.id)) {
      return res.status(400).json({ message: 'The order contains an item that does not exist' });
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 100) {
      return res.status(400).json({ message: 'Quantity must be a whole number from 1 to 100' });
    }
  }
  next();
}

// POST /api/orders  body: { items: [{ id, quantity }], address }
// The client only sends ids and quantities. Names and prices come from OUR menu,
// so nobody can change a price by editing localStorage or the request.
app.post('/api/orders', validateOrder, (req, res) => {
  const { items, address } = req.body;

  const lines = items.map(line => {
    const menuItem = menu.find(m => m.id === line.id);
    return { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: line.quantity };
  });

  const subtotalCents = lines.reduce(
    (sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0
  );

  const order = {
    id: nextOrderId++,
    items: lines,
    address: address.trim(),
    subtotal: subtotalCents / 100,
    delivery: DELIVERY_FEE_CENTS / 100,
    total: (subtotalCents + DELIVERY_FEE_CENTS) / 100,
  };
  orders.push(order);

  res.status(201).json(order); // 201 = Created
});

// PUT /api/orders/1  body: { address }  -> change the delivery address
app.put('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const { address } = req.body ?? {};
  if (!isValidAddress(address)) {
    return res.status(400).json({ message: 'Please enter a valid address' });
  }

  order.address = address.trim();
  res.json(order);
});

// DELETE /api/orders/1  -> cancel the order
app.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  orders.splice(index, 1);
  res.json({ message: 'Order cancelled' });
});

// ---------- 404 (must stay AFTER all routes) ----------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
