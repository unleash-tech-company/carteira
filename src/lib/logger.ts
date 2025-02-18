import pino from 'pino'

const logger = process.env.NODE_ENV === 'production'
  ? {
    debug: () => { },
    info: () => { },
    warn: () => { },
    error: () => { }
  } : pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
        showLevel: true,
      },
    },
    level: 'debug'
  })

export default logger