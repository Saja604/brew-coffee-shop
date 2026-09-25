import {menu, fetchMenu} from "./items.js"

async function loadPage(){
  try{
    await fetchMenu();
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
  renderCart();
  // console.log(menu)
}
loadPage();

export let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
// addToCart(1);

function renderCart(){
  let cartList=``;
  cart.forEach(element => {
    const item = menu.find(menuItem => menuItem.id === element.id);
    if (!item) return;

    cartList+=`
      <div class="col-12">
        <div class="menu-item-container d-flex justify-content-between align-items-center p-1 p-md-2 p-lg-3">
          <div class="container-first-half d-flex align-items-center">
            <div class="item-image-container">
                <img class="item-image"
                  src=${item.image}>
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
  document.querySelector('.cart-container').innerHTML = cartList;

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
  let orderQuantity = 0;
  let subTotal = 0;
  let delivery  = 400;
  let total = 0;

  cart.forEach((cartItem) => {
    const item = menu.find(i => i.id === cartItem.id);
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
}