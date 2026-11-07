document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("maintenance-popup");
  const closeBtn = document.getElementById("close-popup");

  if (!popup || !closeBtn) return;

  const openPopup = () => {
    popup.classList.add("show");
    document.body.classList.add("is-modal-open");
  };

  const closePopup = () => {
    popup.classList.remove("show");
    document.body.classList.remove("is-modal-open");
  };

  // Trigger after site loader finishes
  setTimeout(openPopup, 600);

  closeBtn.addEventListener("click", closePopup);

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("show")) {
      closePopup();
    }
  });
});
