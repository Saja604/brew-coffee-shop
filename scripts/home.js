import {menu, fetchMenu} from "./items.js"
import {addToCart} from "./cart.js"

async function loadPage(){
  try{
    await fetchMenu();
  } catch (error) {
    console.log('unexpected error. Please try again later');
  }
  const bestSellersArray=createBestSellers();
  renderMenu(bestSellersArray);
  const a =createBestSellers();
}
loadPage();

function renderMenu(bestSellersArray){
  let menuList = '';
  bestSellersArray.forEach((item, index)=>{
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

function createBestSellers(){
  let bestSellersArray= [];
  let highestSoldNumber=0;
  let mostSold={};
  let count=0;
  const menuCopy=menu.slice();
  const finalArray = findBestSellers(menuCopy,bestSellersArray, highestSoldNumber, mostSold, count);
  return finalArray;
}

function findBestSellers(menuCopy,bestSellersArray, highestSoldNumber, mostSold, count){
  while(count<7){
    menuCopy.forEach((item, index)=>{
      if(item.sold>highestSoldNumber){
        highestSoldNumber=item.sold;
        mostSold=item;
      }
    })
    bestSellersArray[count]=mostSold;
    const i = menuCopy.findIndex(toremoveItem=>toremoveItem.id === mostSold.id);
    menuCopy.splice(i,1);
    highestSoldNumber=0;
    count++;
  }
  return bestSellersArray;
}