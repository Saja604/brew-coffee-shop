export let menu = []

export function fetchMenu(){
  const promise = fetch('../menu.json')
    .then(response => response.json())
    .then(data => {
      menu = data
      console.log(menu);
    });
    return promise;
}

console.log(menu[0])