// The only place that talks to the orders API (same idea as items.js for the menu).

// POST /api/orders: sends the cart ([{ id, quantity }]) and the address as JSON
export async function createOrder(items, address) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // tells express.json() the body is JSON
    body: JSON.stringify({ items, address })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Could not place the order');
  }
  return data; // the saved order, including the id the server gave it
}

// DELETE /api/orders/:id
export async function cancelOrder(id) {
  const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Could not cancel the order');
  }
  return data;
}