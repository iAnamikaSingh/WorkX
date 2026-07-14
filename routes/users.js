import express from "express";
import passport from "passport";
import User from "../models/user.js";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("signup.ejs", {
    title: "Sign Up",
  });
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      !normalizedUsername ||
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 20
  ) {
      req.session.error = "Username must be between 3 and 20 characters.";
      return res.redirect("/signup");
  }

    // Check whether the email has been verified
    if (req.session.verifiedEmail !== normalizedEmail) {
      req.session.error = "Please verify your email first.";
      return res.redirect("/signup");
    }

    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
    });

    const registeredUser = await User.register(newUser, password);

    // Clear the verification so it cannot be reused
    delete req.session.verifiedEmail;

    req.login(registeredUser, (err) => {
      if (err) {
        console.error(err);
        req.session.error = "Unable to log you in after signup.";
        return res.redirect("/signup");
      }

      req.session.success = "Welcome! Account created successfully.";
      return res.redirect("/logs");
    });
  } catch (err) {
    console.error(err);
    req.session.error = err.message || "Unable to create account.";
    return res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("login.ejs", {
    title: "Login",
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.session.error = "Invalid username or password.";
      return res.redirect("/login");
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      req.session.success = "Logged in successfully.";
      return res.redirect("/logs");
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.success = "Logged out successfully.";
    res.redirect("/login");
  });
});

export default router;
