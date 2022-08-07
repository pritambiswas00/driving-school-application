import * as Joi from "joi";

export const configValidation = Joi.object({
    NODE_ENV : Joi.string().valid("dev", "prod").required(),
    PORT : Joi.number().positive().default(5000),
    DBURI : Joi.string(),
    DATABASE : Joi.string(),
    OPT_VALIDATION_LENGTH : Joi.string().default(4),
    JWT_EXPIRATION_IN_SECONDS: Joi.string().default("3600"),
    TTL : Joi.number().default(10),
    RATE_LIMIT : Joi.number().default(60),
    SUPER_ADMIN_PASSWORD: Joi.string().default("admin@admin.com"),
    SUPER_ADMIN_USERNAME: Joi.string().default("admin@123"),
    SCHEDULE_DATE_LIMIT: Joi.number().default(3),
    JWT_SECRET_ROOT : Joi.string().default("secretkey1"),
    JWT_SECRET_AUTH : Joi.string().default("secretkey3"),
    JWT_SECRET_ADMIN : Joi.string().default("secretkey2"),
    SMTP_HOST: Joi.string().default("smtp.gmail.com"),
    SMTP_PORT: Joi.number().default(465),
    SMTP_USERNAME: Joi.string().default(""),
    SMTP_PASSWORD: Joi.string().default(""),
    MAX_ADMIN_COUNT: Joi.number().default(5),
})