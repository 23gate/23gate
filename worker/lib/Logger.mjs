import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pretty from 'pino-pretty';

export function createLogger(prefix) {
  const filenamePrefix = prefix ? prefix + '.' : '';

  const streams = [
    { stream: fs.createWriteStream(path.join(process.env.LOG_DIR, filenamePrefix + 'info.log'), { flags: 'a' }) },
    { level: 'trace', stream: fs.createWriteStream(path.join(process.env.LOG_DIR, filenamePrefix + 'debug.log'), { flags: 'a' }) },
    { level: 'warn', stream: fs.createWriteStream(path.join(process.env.LOG_DIR, filenamePrefix + 'error.log'), { flags: 'a' }) }
  ];

  const traceLevel = process.env.TRACE ? 'trace' : 'debug';

  if (!process.send) { // not pm2, so add console logger
    streams.unshift({
      level: process.env.NODE_ENV == 'production' ? 'info' : traceLevel,
      stream: pretty({ hideObject: true, sync: true })
    });
  }

  return pino(
    {
      level: traceLevel // this MUST be set at the lowest level of the destinations
    },

    pino.multistream(streams)
  );
}
