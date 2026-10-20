import {fetchMenu} from "./items.js"
import {addToCart} from "./cart.js"

// Listeners are attached ONCE here, not inside renderMenu.
// Before, every render added another listener to the same buttons.
document.querySelectorAll('.menu-option').forEach((optionButton) => {
  optionButton.addEventListener('click', () => {
    loadMenu(optionButton.textContent.trim());
  });
});

// Add-to-cart buttons are recreated on every render, so one listener on the container handles them all
document.querySelector('.js-menu').addEventListener('click', (e) => {
  const button = e.target.closest('.add-to-cart-button');
  if (button) {
    addToCart(Number(button.dataset.id));
  }
});

async function loadMenu(option){
  // "View All" means no filter; anything else is sent as ?category=...
  const filters = option === 'View All' ? {} : { category: option };

  try{
    const items = await fetchMenu(filters);
    renderMenu(items);
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
}
loadMenu('View All');

// One template instead of two copies
function renderMenu(items){
  let menuList = '';
  items.forEach((item)=>{
    menuList+=`
      <div class="col-12 col-md-6 col-xl-4">
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
            <div>
              <button type="button" class="btn btn-primary add-to-cart-button" data-id="${item.id}">
                <i class="bi bi-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  document.querySelector('.js-menu').innerHTML=menuList;
}
