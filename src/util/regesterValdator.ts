import Joi from "joi";

const regesterSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
    "string.base": "Name must be a string",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Custom error: The email format is invalid.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),

  gender: Joi.string().required().messages({
    "string.empty": "Gender is required",
    "string.base": "Gender must be a string",
  }),
})
  .required()
  .messages({
    "object.base": "Invalid input data format",
  })
  .unknown(false); // Disallow additional properties

export default regesterSchema;
