fetch('header.html').then((response) => {
  return response.text()
}).then((html) => {
  document.querySelector('.js-header').innerHTML=html;

  const toggleButton = document.querySelector('.navbar-toggler');
  const navigation = document.querySelector('#headerRightNav');

  toggleButton.addEventListener('click', () => {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    toggleButton.setAttribute('aria-expanded', String(!isExpanded));
    navigation.classList.toggle('is-open', !isExpanded);
  });

  // document.querySelector('.cart-quantity').innerHTML=calcQuantity();
})