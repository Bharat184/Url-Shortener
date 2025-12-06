import { body, validationResult, check } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    const redirectUrl = req.header("Referer") || req.originalUrl || "/";
    return res.redirect(redirectUrl);
  }
  next();
};

export const loginValidation = [
    body("email")
    .trim()
    .escape()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email'),
    body("password").trim().escape().notEmpty().withMessage('Password Required'),
];


export const verifyValidation = [
    // 1. Validate the total length of the array (e.g., must have 6 digits)
    body("otp")
        .isArray()
        .withMessage("OTP must be provided as an array.")
        .isLength({ min: 6, max: 6 }) // Adjust min/max as needed for your OTP length
        .withMessage("OTP must contain exactly 6 digits."),

    // 2. Validate the constraints for EACH element in the array
    check("otp.*")
        .isLength({ min: 1, max: 1 })
        .withMessage("Each OTP box must contain exactly 1 digit.")
        .isNumeric()
        .withMessage("OTP digits must contain only numbers.")
];