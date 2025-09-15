// Utility for notifications
export function notify(message) {
  alert(message);
}

export function showError(message) {
  console.error(message);
  alert(`Error: ${message}`);
}

export function showSuccess(message) {
  console.log(message);
  alert(`Success: ${message}`);
}
