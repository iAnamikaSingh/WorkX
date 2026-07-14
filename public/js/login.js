document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const togglePasswordButton = document.getElementById("togglePassword");
  const forms = document.querySelectorAll(".needs-validation");

// to apply custom validation
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if(!form.checkValidity()){
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    } )
  });

  //to toggle 
  if (passwordInput && togglePasswordButton) {
    togglePasswordButton.addEventListener("click", () => {
      const icon = togglePasswordButton.querySelector("i");
      const isHidden = passwordInput.type === "password";

      passwordInput.type = isHidden ? "text" : "password";
      togglePasswordButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

      if (icon) {
        icon.classList.toggle("fa-eye", !isHidden);
        icon.classList.toggle("fa-eye-slash", isHidden);
      }
    });
  }
});
