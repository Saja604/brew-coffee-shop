export let menu = []

export function fetchMenu(){
  const promise = fetch('../menu.json')
    .then(response => response.json())
    .then(data => {
      menu = data
    });
    return promise;
}