const Joi = require('joi');

const LoginSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(50)
        .required(),
    password: Joi.string()
        .required()
        .min(3)
})

const SignupSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(50)
        .required(),
})

module.exports = {
    LoginSchema,
    SignupSchema
}