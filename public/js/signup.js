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
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if(!form.checkValidity()){
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    } )
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

  //Sending OTP to email
  
  sendOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    if(!email){
      alert("Please enter your email before requesting an OTP");
      return;
    }
    
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    const response = await fetch("/api/send-otp",{
      method:"POST",
      headers:{"Content-Type" : "application/json"} ,
      body: JSON.stringify({email: email})
    }
    
  )    
  const data = await response.json();
  if(data.success){
    otpMsg.classList.remove("text-danger");
    otpMsg.classList.add("text-success"); 

    // Resend OTP
    function startResendTimer() {
      clearInterval(resendTimer);
      let timeLeft = 180; // 3 minutes
      resendTimer = setInterval(() => {
  
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
  
          sendOtpBtn.textContent =
              `Resend OTP (${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")})`;
  
          timeLeft--;
  
          if (timeLeft < 0) {
  
              clearInterval(resendTimer);
  
              sendOtpBtn.disabled = false;
              sendOtpBtn.textContent = "Resend OTP";
  
          }
  
      }, 1000);
  
  }
  startResendTimer()
    

    //Display OTP section
    otpSection.style.display = "block";
    verificationMsg.textContent = "";
    
  }else{
    otpMsg.classList.remove("text-success");
    otpMsg.classList.add("text-danger");
    sendOtpBtn.textContent = "Send OTP";
    sendOtpBtn.disabled = false;
  }
  

  alert(data.message);
  
  });
  


  //Verify Email
 
  verifyEmailBtn.addEventListener("click", async () => {
    const otpInput = document.getElementById("otp");
    if(!otpInput.value.trim()){
      alert("Please enter OTP to verify email");
      return;
    }
    const res = await fetch("/api/verify-otp", {
      method:"POST",
      headers:{"Content-Type": "application/json"},
      body:JSON.stringify({email:emailInput.value.trim(), otp: otpInput.value.trim()})
    });
    const data = await res.json();
    
    if(data.success){
      verificationMsg.classList.remove("text-danger");
      verificationMsg.classList.add("text-success");
      verificationMsg.textContent = data.message;
      // otp section removal
      setTimeout(() => {

        otpSection.style.display = "none";
        clearInterval(resendTimer);
        sendOtpBtn.textContent = "Email Verified";

        sendOtpBtn.classList.remove("btn-outline-info");
        sendOtpBtn.classList.add("btn-success");

        sendOtpBtn.disabled = true;
        otpMsg.textContent = "";

    }, 1000);
    }else{
      verificationMsg.classList.remove("text-success");
      verificationMsg.classList.add("text-danger");
      verificationMsg.textContent = data.message;
    }
    
  });


  
  // End
})

