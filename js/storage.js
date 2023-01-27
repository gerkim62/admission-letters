// Function to store an array to local storage
export function storeArray(array=[],name) {
  localStorage.setItem(name, JSON.stringify(array));
}

// Function to retrieve an array from local storage
export function getStoredArray(name) {
  return JSON.parse(localStorage.getItem(name))||[];
}
