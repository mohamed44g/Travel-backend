import Joi from "joi";

const ResetPassword = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "The email format is invalid.",
  }),
})
  .required()
  .messages({
    "object.base": "Invalid input data format",
  })
  .unknown(false); // Disallow additional properties

export default ResetPassword;
