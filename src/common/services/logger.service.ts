import { ConsoleLogger, Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import * as zlib from 'zlib';
import { getEnv } from '../utils/env';

@Injectable()
export class Logger extends ConsoleLogger implements OnModuleInit {
  public readonly logger: winston.Logger;

  constructor() {
    super();

    const zipEnabled = getEnv('APP_LOG_ZIP', 'false') === 'true';

    const logDir = path.join(process.cwd(), getEnv('APP_LOG_DIR', 'logs'));
    const auditDir = path.join(process.cwd(), getEnv('APP_AUDIT_DIR', 'logs/audit'));
    const zipDir = path.join(process.cwd(), getEnv('APP_ZIP_DIR', 'logs/zip'));

    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });
    if (!fs.existsSync(zipDir) && zipEnabled) fs.mkdirSync(zipDir, { recursive: true });

    const excludeErrors = winston.format((info) => {
      return info.level !== 'error' ? info : false;
    });

    this.logger = winston.createLogger({
      level: getEnv('LOG_LEVEL', 'silly'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          ({ timestamp, level, message, stack }) =>
            `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`,
        ),
      ),
      transports: [
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'info.log'),
          level: 'silly',
          format: winston.format.combine(
            excludeErrors(),
            winston.format.timestamp(),
            winston.format.printf(
              ({ timestamp, level, message, stack }) =>
                `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`,
            ),
          ),
        }),
      ],
    });
  }

  onModuleInit() {
    this.watchLog('info');
    this.watchLog('error');
  }

  private watchLog(type: 'info' | 'error') {
    const zipEnabled = getEnv('APP_LOG_ZIP', 'false') === 'true';
    if (!zipEnabled) return;
    const logDir = path.join(process.cwd(), getEnv('APP_LOG_DIR', 'logs'));
    const file = path.join(logDir, `${type}.log`);
    const maxSize = this.parseSize(getEnv('APP_LOG_MAX_SIZE', '10m'));
    fs.watchFile(file, (curr) => {
      if (curr.size >= maxSize) this.compressAndRotate(file, type);
    });
  }

  private compressAndRotate(file: string, type: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipDir = path.join(process.cwd(), getEnv('APP_ZIP_DIR', 'logs/zip'));
    const outputFile = path.join(zipDir, `${type}-${timestamp}.gz`);
    const gzip = zlib.createGzip();
    fs.createReadStream(file).pipe(gzip).pipe(fs.createWriteStream(outputFile)).on('close', () => {
      setTimeout(() => {
        try { fs.truncateSync(file, 0); } catch {}
      }, 100);
    });
  }

  private parseSize(size: string): number {
    const match = size.toLowerCase().match(/(\d+)([kmg]?)/);
    if (!match) return 10 * 1024 * 1024;
    const num = parseInt(match[1], 10);
    switch (match[2]) {
      case 'k': return num * 1024;
      case 'm': return num * 1024 * 1024;
      case 'g': return num * 1024 * 1024 * 1024;
      default: return num;
    }
  }

  log(message: any, context?: string, ...rest: any[]) {
    if (context) super.log(message, context, ...rest);
    else super.log(message);
    this.logger.info(this.fmt(message, context, rest));
  }

  error(message: any, trace?: string, context?: string, ...rest: any[]) {
    if (trace && context) super.error(message, trace, context, ...rest);
    else if (trace) super.error(message, trace);
    else super.error(message);
    this.logger.error(this.fmt(message, context, [trace, ...rest]));
  }

  warn(message: any, context?: string, ...rest: any[]) {
    if (context) super.warn(message, context, ...rest);
    else super.warn(message);
    this.logger.warn(this.fmt(message, context, rest));
  }

  debug(message: any, context?: string, ...rest: any[]) {
    if (context) super.debug(message, context, ...rest);
    else super.debug(message);
    this.logger.debug(this.fmt(message, context, rest));
  }

  private fmt(message: any, context?: string, params: any[] = []): string {
    const rest = params.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
    return `[${context ?? 'App'}] ${[message, ...rest].join(' ')}`;
  }
}
