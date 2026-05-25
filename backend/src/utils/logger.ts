import winston from "winston";


const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }), 
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0
        ? `\n  ${JSON.stringify(meta, null, 2)}`
        : "";

    const stackStr = stack ? `\n${stack}` : "";

    return `${timestamp} [${level}]: ${message}${metaStr}${stackStr}`;
  })
);


const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format:
      process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  }),
];


if (process.env.NODE_ENV === "production") {
  transports.push(

    new winston.transports.File({
      filename: "logs/app.log",
      format:   prodFormat,
      maxsize:  5 * 1024 * 1024, // 5MB per file
      maxFiles: 5,               
    }),

    new winston.transports.File({
      filename: "logs/error.log",
      level:    "error",
      format:   prodFormat,
      maxsize:  5 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({

  level: process.env.LOG_LEVEL || "info",

  transports,

  exitOnError: false,
});

export default logger;