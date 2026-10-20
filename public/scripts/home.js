import {fetchMenu} from "./items.js"
import {addToCart} from "./cart.js"

async function loadPage(){
  try{
    // The server sorts and limits now, so the old createBestSellers/findBestSellers code is gone
    const bestSellers = await fetchMenu({ sort: 'sold', limit: 7 });
    renderMenu(bestSellers);
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
}
loadPage();

function renderMenu(bestSellersArray){
  let menuList = '';
  bestSellersArray.forEach((item)=>{
    menuList+=`
    <div class="menu-item-container container flex-shrink-0 p-1 p-md-2 p-lg-3">
      <div class="container-first-half">
        <div class="item-image-container">
            <img class="item-image img-fluid"
              src="${item.image}">
        </div>
        <div class="item-name">
            ${item.name}
        </div>
      </div>
      <div class="container-second-half d-flex align-items-center justify-content-between p-2">
        <div class="item-price">$${item.price}</div>
        <div>
          <button type="button" class="btn btn-primary add-to-cart-button" data-id="${item.id}">
            <i class="bi bi-cart"></i>
          </button>

        </div>
      </div>
    </div>
    `
  });
  document.querySelector('.best-sellers-section').innerHTML=menuList;

  document.querySelectorAll('.add-to-cart-button').forEach((cartB) => {
      cartB.addEventListener('click', () => {
        const id = Number(cartB.dataset.id);
        addToCart(id);
      })
    })
}
