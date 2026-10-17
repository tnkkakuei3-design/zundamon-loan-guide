document.querySelectorAll('[data-dialog]').forEach(button => {
  const dialog = document.getElementById(button.dataset.dialog);
  button.addEventListener('click', () => dialog.showModal());
  dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(close => {
    close.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => button.focus());
});
