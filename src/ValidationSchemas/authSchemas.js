import joi from "joi";

// register schema

export const registerSchema = joi.object({
  name: joi.string().max(25).min(3).required(),
  email: joi.string().email().required(),
  phone: joi.string().pattern(new RegExp("^\\+?[0-9]{10,15}$")).required(),
  password: joi.string().min(8).max(100).required(),
  profession: joi.string().max(25).allow("", null),
});

// login schema

export const loginSchema = joi.object({
  identifier: joi
    .alternatives()
    .try(joi.string().email(), joi.string().pattern(new RegExp("^\\+?[0-9]{10,15}$")))
    .required(),
  password: joi.string().min(8).max(100).required(),
});

// forgot password schema

export const forgotPasswordSchema = joi.object({
  identifier: joi
    .alternatives()
    .try(joi.string().email(), joi.string().pattern(new RegExp("^\\+?[0-9]{10,15}$")))
    .required(), // email or phone
});

// reset password schema

export const resetPasswordSchema = joi.object({
  identifier: joi
    .alternatives()
    .try(joi.string().email(), joi.string().pattern(new RegExp("^\\+?[0-9]{10,15}$")))
    .required(),
  code: joi.string().length(6).required(),
  newPassword: joi.string().min(8).max(100).required(),
});
