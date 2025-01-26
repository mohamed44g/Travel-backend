import Joi from "joi";

const CommentSchema = Joi.object({
  comment: Joi.string().required().trim().messages({
    "string.required": "comment text is required",
    "string.empty": "comment text is required",
  }),

  rate: Joi.number().required().messages({
    "number.required": "rate is required",
    "number.empty": "rate is required",
  }),

  tripId: Joi.number().required().messages({
    "number.required": "tripId is required",
    "number.empty": "tripId is required",
  }),
})
  .required()
  .unknown(false); // Disallow additional properties

export default CommentSchema;
