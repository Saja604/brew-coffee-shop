// The only place that talks to the menu API.
// Other files import these functions instead of calling fetch themselves.

// fetchMenu() -> all items
// fetchMenu({ category: 'Coffee' }) -> one category
// fetchMenu({ sort: 'sold', limit: 7 }) -> best sellers
export async function fetchMenu(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const response = await fetch(query ? `/api/menu?${query}` : '/api/menu');
  if (!response.ok) {
    throw new Error(`Menu request failed (${response.status})`);
  }
  return response.json();
}

// fetchMenuItem(3) -> one item, or null if the server says 404
export async function fetchMenuItem(id) {
  const response = await fetch(`/api/menu/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Item request failed (${response.status})`);
  }
  return response.json();
}
