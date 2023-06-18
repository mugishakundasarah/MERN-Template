const Joi = require("joi")

module.exports.UserValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  phone:  Joi.string().length(10).pattern(/^0[0-9]{9}$/).required(),
  password: Joi.string().required(),
  nationalId: Joi.string().length(16).message("National Id must be atleast 16 characters"),
  role: Joi.string().valid('ADMIN').default('ADMIN')
}).unknown();

module.exports.LoginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required() 
}).unknown()
