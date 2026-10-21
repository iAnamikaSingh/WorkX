"use strict"
document.addEventListener("DOMContentLoaded", () => {
  let resendTimer;
  const otpSection = document.getElementById("otp-section");
  const verificationMsg = document.getElementById("verification-msg");
  const passwordInput = document.querySelector("#password");
  const togglePasswordBtn = document.querySelector("#togglePassword");
  const sendOtpBtn = document.querySelector(".send-otp");
  const emailInput = document.querySelector("#email");
  const otpMsg = document.getElementById("otp-msg");
  const verifyEmailBtn = document.querySelector(".verify-email");
  const forms = document.querySelectorAll(".needs-validation");
  const signupBtn = document.getElementById("signup-btn");
  const usernameInput = document.getElementById("username");
  const usernameFeedback = document.getElementById("usernameFeedback");
  const usernameStatus = document.getElementById("usernameStatus");
  //Displaying invalid-feedback based on username input value
  let verifiedEmail = null;
  emailInput.addEventListener("input", () => {

    const currentEmail = emailInput.value.trim().toLowerCase();

    if (verifiedEmail && currentEmail !== verifiedEmail) {

        verifiedEmail = null;

        clearInterval(resendTimer);

        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Send OTP";

        sendOtpBtn.classList.remove("btn-success");
        sendOtpBtn.classList.add("btn-outline-info");

        document.getElementById("otp").value = "";
        otpSection.style.display = "none";
        verificationMsg.textContent = "";
        verificationMsg.classList.remove("text-success", "text-danger");
        otpMsg.textContent = "";
        verifyEmailBtn.disabled = false;
    }

});
  usernameInput.addEventListener("invalid", () => {
    if(usernameInput.validity.valueMissing) {
      usernameFeedback.textContent = "Username is required";
    }else if(usernameInput.validity.tooShort || usernameInput.validity.tooLong) {
      usernameFeedback.textContent = "Username must be between 3 and 20 characters long"
    }
  })  

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if(!form.checkValidity()){
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    } )
  });
  
  //Check whether username exists during signup 
  let timeoutId;

  usernameInput.addEventListener("input", () => {

    clearTimeout(timeoutId);

    const username = usernameInput.value.trim();

    // Clear message
    usernameStatus.textContent = "";

    // Don't check until username is valid length
    if (username.length < 3) {
        return;
    }

    usernameStatus.textContent = "Checking...";

    timeoutId = setTimeout(async () => {

        try {

            const response = await fetch(
                `/api/check-username?username=${encodeURIComponent(username)}`
            );

            const data = await response.json();

            if (data.available) {

                usernameStatus.textContent = "✓ Username available";
                usernameStatus.className = "text-success small";

            } else {

                usernameStatus.textContent = "✗ Username already taken";
                usernameStatus.className = "text-danger small";

            }

        } catch (err) {

            usernameStatus.textContent = "";
            console.error(err);

        }

    }, 500);

});

  // Toggle visibility of password
  
  if(passwordInput && togglePasswordBtn){
    togglePasswordBtn.addEventListener("click", () => {
        const icon = togglePasswordBtn.querySelector("i");
        if(passwordInput.type === "password"){
          passwordInput.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          passwordInput.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
    } );
  }

  // Sending OTP

sendOtpBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim().toLowerCase();

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = "Sending...";
  otpMsg.textContent = "Sending your verification code...";
  otpMsg.classList.remove("text-success", "text-danger");
  let otpSent = false;
  const controller = new AbortController();
  const requestTimeout = setTimeout(() => controller.abort(), 50_000);

  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.success) {
      otpSent = true;
      otpMsg.classList.remove("text-danger");
      otpMsg.classList.add("text-success");
      otpMsg.textContent = data.message;

      // Resend OTP
      function startResendTimer() {
        clearInterval(resendTimer);

        let timeLeft = 180;

        resendTimer = setInterval(() => {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;

          sendOtpBtn.textContent = `Resend OTP (${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")})`;

          timeLeft--;

          if (timeLeft < 0) {
            clearInterval(resendTimer);

            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Resend OTP";
          }
        }, 1000);
      }

      startResendTimer();

      // Display OTP section
      otpSection.style.display = "block";
      verificationMsg.textContent = "";
    } else {
      otpMsg.classList.remove("text-success");
      otpMsg.classList.add("text-danger");
      otpMsg.textContent =
        data?.message || "Unable to send the verification code. Please try again.";
    }
  } catch (err) {
    console.error(err);
    otpMsg.classList.remove("text-success");
    otpMsg.classList.add("text-danger");
    otpMsg.textContent =
      err.name === "AbortError"
        ? "Sending timed out. Please try again."
        : "Unable to reach the email service. Please try again.";
  } finally {
    clearTimeout(requestTimeout);
    if (!otpSent) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Send OTP";
    }
  }
});


  //Verify Email

verifyEmailBtn.addEventListener("click", async () => {
  const otpInput = document.getElementById("otp");

  if (!otpInput.value.trim()) {
    alert("Please enter OTP to verify email");
    return;
  }

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        otp: otpInput.value.trim(),
      }),
    });

    const data = await res.json();

    if (data.success) {
      verifiedEmail = emailInput.value.trim().toLowerCase();

      verificationMsg.classList.remove("text-danger");
      verificationMsg.classList.add("text-success");
      verificationMsg.textContent = data.message;

      setTimeout(() => {
        otpSection.style.display = "none";

        clearInterval(resendTimer);

        sendOtpBtn.textContent = "Email Verified";

        sendOtpBtn.classList.remove("btn-outline-info");
        sendOtpBtn.classList.add("btn-success");

        sendOtpBtn.disabled = true;

        otpMsg.textContent = "";
      }, 1000);
    } else {
      verificationMsg.classList.remove("text-success");
      verificationMsg.classList.add("text-danger");
      verificationMsg.textContent = data.message;
    }
  } catch (err) {
    console.error(err);

    alert("Unable to verify OTP. Please try again.");
  }
});


  
  // End
})
