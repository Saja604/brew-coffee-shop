import {menu, fetchMenu} from "./items.js"
import {addToCart} from "./cart.js"

async function loadPage(){
  try{
    await fetchMenu();
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
  renderMenu('View All');
  // console.log(menu)
}
loadPage();

function renderMenu(option){
  let menuList = '';
  menu.forEach((item, index)=>{
    if(option==='View All'){
      menuList+=`
      <div class="col-12 col-md-6 col-xl-4">
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
            <div>
              <button type="button" class="btn btn-primary add-to-cart-button" data-id="${item.id}">
                <i class="bi bi-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    }
    else if(item.category===option){
      menuList+=`
      <div class="col-12 col-md-6 col-xl-4">
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
            <div>
              <button type="button" class="btn btn-primary add-to-cart-button" data-id="${item.id}">
                <i class="bi bi-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    }
   
  });
  document.querySelector('.js-menu').innerHTML=menuList;

  document.querySelectorAll('.menu-option').forEach((optionButton)=>{
    optionButton.addEventListener('click', ()=>{
      const preference= optionButton.innerHTML;
      renderMenu(preference);
    })
  })

  document.querySelectorAll('.add-to-cart-button').forEach((cartB) => {
    cartB.addEventListener('click', () => {
      const id = Number(cartB.dataset.id);
      console.log(id);
      addToCart(id);
    })
  })
  
}