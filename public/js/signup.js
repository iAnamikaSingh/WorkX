document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".needs-validation");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const otpInput = document.getElementById("otp");
  const sendOtpButton = document.getElementById("sendOtpButton");
  const verifyOtpButton = document.getElementById("verifyOtpButton");
  const otpGroup = document.querySelector(".otp-group");
  const verificationMessage = document.getElementById("verificationMessage");
  const togglePasswordBtn = document.getElementById("togglePassword");

  let otpVerified = false;

  const getFeedbackEl = (input) => input?.closest(".floating-group")?.querySelector(".invalid-feedback");

  const showFieldMessage = (input, defaultMessage) => {
    const feedbackEl = getFeedbackEl(input);
    if (!input || !feedbackEl) return;

    if (input.validity.valueMissing) {
      feedbackEl.textContent = `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required.`;
    } else if (input.validity.tooShort) {
      feedbackEl.textContent = defaultMessage;
    } else if (input.validity.typeMismatch) {
      feedbackEl.textContent = "Please enter a valid email address.";
    } else {
      feedbackEl.textContent = defaultMessage;
    }
  };

  const updateVerificationUI = (message, visible = true, success = false) => {
    if (!verificationMessage) return;
    verificationMessage.style.display = visible ? "block" : "none";
    verificationMessage.innerHTML = `<span class="${success ? "text-success" : "text-info"}">${message}</span>`;
  };

  const resetOtpState = () => {
    otpVerified = false;
    if (otpGroup) otpGroup.style.display = "none";
    if (verificationMessage) verificationMessage.style.display = "none";
    if (otpInput) {
      otpInput.disabled = false;
      otpInput.value = "";
    }
    if (verifyOtpButton) verifyOtpButton.disabled = false;
  };

  if (email) {
    email.addEventListener("input", () => {
      showFieldMessage(email, "Please enter a valid email address.");
      resetOtpState();
    });
  }

  if (username) {
    username.addEventListener("input", () => {
      showFieldMessage(username, "Username must be at least 3 characters long.");
    });
  }

  if (password) {
    password.addEventListener("input", () => {
      showFieldMessage(password, "Password must be at least 8 characters long.");
    });
  }

  const sendOtp = async () => {
    if (!email || !email.value.trim()) {
      alert("Please enter your email before requesting an OTP.");
      return;
    }

    sendOtpButton.disabled = true;
    sendOtpButton.textContent = "Sending...";

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        if (otpGroup) otpGroup.style.display = "block";
        updateVerificationUI("OTP sent. Enter it below and verify.");
      } else {
        alert(data.message || "Unable to send OTP.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to send OTP right now. Please try again.");
    } finally {
      sendOtpButton.disabled = false;
      sendOtpButton.textContent = "Send OTP";
    }
  };

  const verifyOtp = async () => {
    if (!email || !email.value.trim()) {
      alert("Please enter your email before verifying OTP.");
      return;
    }

    if (!otpInput || !otpInput.value.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = "Verifying...";

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value.trim(), otp: otpInput.value.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        otpVerified = true;
        updateVerificationUI("OTP verified. Complete signup.", true, true);
        if (otpInput) otpInput.disabled = true;
        if (verifyOtpButton) verifyOtpButton.disabled = true;
      } else {
        otpVerified = false;
        updateVerificationUI(data.message || "OTP verification failed.", true, false);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to verify OTP right now.");
    } finally {
      if (verifyOtpButton) {
        verifyOtpButton.disabled = false;
        verifyOtpButton.textContent = "Verify OTP";
      }
    }
  };

  if (sendOtpButton) {
    sendOtpButton.addEventListener("click", sendOtp);
  }

  if (verifyOtpButton) {
    verifyOtpButton.addEventListener("click", verifyOtp);
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      [username, email, password].forEach((input) => {
        if (!input) return;
        showFieldMessage(
          input,
          input.id === "password"
            ? "Password must be at least 8 characters long."
            : input.id === "username"
            ? "Username must be at least 3 characters long."
            : "Please enter a valid email address.",
        );
      });

      if (!otpVerified) {
        event.preventDefault();
        event.stopPropagation();
        alert("Please verify your email with OTP before signing up.");
        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add("was-validated");
    });
  }

  if (togglePasswordBtn && password) {
    togglePasswordBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const icon = togglePasswordBtn.querySelector("i");

      if (password.type === "password") {
        password.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        password.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }
});
