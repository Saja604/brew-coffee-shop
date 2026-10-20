import {fetchMenuItem} from "./items.js"
import {createOrder, cancelOrder} from "./orders.js"

export let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Item details (name, price, image) fetched from /api/menu/:id, stored by id
let itemsById = {};

function saveToLocalStorage(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(itemId){
  const matchingItem = cart.find(cartItem => cartItem.id === itemId);

  if(matchingItem){
    matchingItem.quantity +=1;
    saveToLocalStorage()
  }
  else{
    cart.push({id: itemId, quantity: 1});
    saveToLocalStorage();
  }
}

async function loadPage(){
  // cart.js is also imported by the home and menu pages, so only render on the cart page
  const cartContainer = document.querySelector('.cart-container');
  if (!cartContainer) return;

  // "Order now" lives inside .order-details, which gets re-rendered, so one listener on the parent handles it
  document.querySelector('.order-details').addEventListener('click', (e) => {
    if (e.target.closest('button.order-now-div')) {
      placeOrder();
    }
  });

  // Same idea for the "Cancel order" button shown after an order is placed
  cartContainer.addEventListener('click', (e) => {
    const cancelButton = e.target.closest('.cancel-order-button');
    if (cancelButton) {
      cancelPlacedOrder(Number(cancelButton.dataset.id));
    }
  });

  try{
    // One request per cart item, all sent at the same time
    const items = await Promise.all(cart.map(cartItem => fetchMenuItem(cartItem.id)));
    items.forEach(item => {
      if (item) itemsById[item.id] = item; // null means the server answered 404, so skip it
    });
    renderCart();
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
}
loadPage();

async function placeOrder(){
  const address = document.querySelector('.address-input').value.trim();

  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  if (address === '') {
    alert('Please enter your address');
    return;
  }

  // Disable the button so a double click can't create two orders
  const orderButton = document.querySelector('button.order-now-div');
  orderButton.disabled = true;

  try{
    const order = await createOrder(cart, address);

    cart.length = 0;          // empty the cart (same array, so other files see it too)
    saveToLocalStorage();
    showConfirmation(order);
    renderOrderSummary();
    document.querySelector('.address-input').value = '';
  } catch (error) {
    alert(error.message);     // e.g. the 400 messages written in server.js
    orderButton.disabled = false;
  }
}

function showConfirmation(order){
  const container = document.querySelector('.cart-container');
  container.innerHTML = `
    <div class="col-12 order-confirmation">
      <div>Thank you! Order #${order.id} was placed.</div>
      <div>Total: $${order.total.toFixed(2)}</div>
      <div>Delivering to: <span class="confirmation-address"></span></div>
      <button type="button" class="cancel-order-button p-1 p-md-2 mt-2" data-id="${order.id}">Cancel order</button>
    </div>
  `;
  // The address is text the user typed, so it goes in with textContent, never inside innerHTML
  container.querySelector('.confirmation-address').textContent = order.address;
}

async function cancelPlacedOrder(orderId){
  try{
    await cancelOrder(orderId);
    document.querySelector('.cart-container').innerHTML = 'Your order was cancelled.';
  } catch (error) {
    alert(error.message);
  }
}

function renderCart(){
  let cartList=``;
  cart.forEach(element => {
    const item = itemsById[element.id];
    if (!item) return;

    cartList+=`
      <div class="col-12">
        <div class="menu-item-container d-flex justify-content-between align-items-center p-1 p-md-2 p-lg-3">
          <div class="container-first-half d-flex align-items-center">
            <div class="item-image-container">
                <img class="item-image"
                  src="${item.image}">
            </div>
            <div class="item-name">
                ${item.name}
            </div>
          </div>
          <div class="container-second-half d-flex align-items-center">
            <div class="item-price">$ ${item.price}</div>
            <div class="item-quantity">
              <label>quantity: </label>
              <input
                type="number"
                class="quantity-input"
                min="1"
                max="100"
                value="${element.quantity}"
                data-id="${element.id}"
              >
            </div>
          </div>
        </div>
      </div>
    `
  });

  if (cart.length === 0){
    document.querySelector('.cart-container').innerHTML = `Your cart is empty`;
  }
  else{
    document.querySelector('.cart-container').innerHTML = cartList;
  }

  document.querySelector('.cart-container').addEventListener('change', (e) => {
    if (e.target.classList.contains('quantity-input')) {
      const id = Number(e.target.dataset.id);
      const newQty = Number.parseInt(e.target.value, 10);
      if (!Number.isInteger(newQty) || newQty < 1) return;

      // find the cart item and update it
      const item = cart.find(i => i.id === id);
      if (item) {
        item.quantity = newQty;
        saveToLocalStorage();
        renderOrderSummary();
      }
    }
  });
  renderOrderSummary()
}
function renderOrderSummary(){
  // The summary is rebuilt on every change, so remember what the user already typed
  const typedAddress = document.querySelector('.address-input')?.value ?? '';

  let orderQuantity = 0;
  let subTotal = 0;
  let delivery  = cart.length === 0 ? 0 : 400; // no delivery fee on an empty cart
  let total = 0;

  cart.forEach((cartItem) => {
    const item = itemsById[cartItem.id];
    if (!item) return; // item no longer exists on the server
    const itemCost = (item.price*100)*(cartItem.quantity);
    orderQuantity+=cartItem.quantity;
    subTotal+= itemCost;
  })
  total = ((subTotal + delivery)/100).toFixed(2);

  let orderList=`
    <div class="row g-2">
      <div class="order-summary-title">
      Order Summary
      </div>
      <div class="order-total py-2">
        <div>Sub total: $${(subTotal/100).toFixed(2)}</div>
        <div>Delivery: $${(delivery/100).toFixed(2)}</div>
        <div>Total: $${total}</div>
      </div>
      <div class="order-address">
        <div>Enter your address</div>
        <input class="address-input" type="text"></input>
      </div>
      <div class="order-now-div">
        <button class="order-now-div">Order now</button>
      </div>
    </div>
  `;
  document.querySelector('.order-details').innerHTML = orderList;
  document.querySelector('.address-input').value = typedAddress;
}
