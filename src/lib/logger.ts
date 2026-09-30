type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

interface LogPayload {
  level: LogLevel;
  event: string;
  details?: any;
  userId?: string;
  timestamp: string;
}

const REDACTED_KEYS = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'ssn', 'medicalHistory', 'diagnosis', 'treatment'];

function redact(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  
  const newObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_KEYS.includes(key) || key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
      newObj[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      newObj[key] = redact(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

class Logger {
  private log(level: LogLevel, event: string, details?: any, userId?: string) {
    const payload: LogPayload = {
      level,
      event,
      timestamp: new Date().toISOString(),
      ...(userId && { userId }),
      ...(details && { details: redact(details) }),
    };

    // In a real application, send this to DataDog, Sentry, or CloudWatch
    if (process.env.NODE_ENV !== 'test') {
      const output = JSON.stringify(payload);
      if (level === 'ERROR' || level === 'SECURITY') {
        console.error(output);
      } else if (level === 'WARN') {
        console.warn(output);
      } else {
        console.log(output);
      }
    }
    
    // For the purpose of the Operational Dashboard, we can store in-memory mock logs if in dev
    if (typeof global !== 'undefined') {
      if (!global.__mockSystemLogs) global.__mockSystemLogs = [];
      global.__mockSystemLogs.unshift({ ...payload, id: `log_${Date.now()}_${Math.random()}` });
      if (global.__mockSystemLogs.length > 500) global.__mockSystemLogs.pop();
    }
  }

  info(event: string, details?: any, userId?: string) {
    this.log('INFO', event, details, userId);
  }

  warn(event: string, details?: any, userId?: string) {
    this.log('WARN', event, details, userId);
  }

  error(event: string, error: Error | any, userId?: string) {
    this.log('ERROR', event, { 
      message: error?.message || error,
      stack: error?.stack 
    }, userId);
  }

  security(event: string, details?: any, userId?: string) {
    this.log('SECURITY', event, details, userId);
  }
}

export const logger = new Logger();

declare global {
  var __mockSystemLogs: any[];
}
