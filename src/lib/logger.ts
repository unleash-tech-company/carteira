import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
      showLevel: true,
    },
  },
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
})

export default logger 