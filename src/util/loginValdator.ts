import Joi from "joi";

const LoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "The email format is invalid.",
  }),

  password: Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
})
  .required()
  .messages({
    "object.base": "Invalid input data format",
  })
  .unknown(false); // Disallow additional properties

export default LoginSchema;
