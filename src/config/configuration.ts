export const configuration = () => {
     return {
        ENV : process.env.NODE_ENV,
        PORT : process.env.PORT,
        DBURI : process.env.DBURI,
        DATABASE : process.env.DATABASE,
        OPT_VALIDATION_LENGTH : process.env.OPT_VALIDATION_LENGTH,
        JWT_SECRET_ROOT : process.env.JWT_SECRET_ROOT,
        JWT_SECRET_AUTH : process.env.JWT_SECRET_AUTH,
        JWT_SECRET_ADMIN : process.env.JWT_SECRET_ADMIN,
        JWT_EXPIRES_TIME: process.env.JWT_EXPIRES_TIME,
        TTL:process.env.TTL,
        RATE_LIMIT : process.env.RATE_LIMIT,
        SUPER_ADMIN_USERNAME: process.env.SUPER_ADMIN_USERNAME,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
        SCHEDULE_DATE_LIMIT: process.env.SCHEDULE_DATE_LIMIT,
        SMTP_HOST: process.env.SMTPHOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USERNAME: process.env.SMTP_USERNAME,
        SMTP_PASSWORD :process.env.SMTP_PASSWORD
     }
}


  