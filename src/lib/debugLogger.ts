/**
 * Debug logger for passkey operations
 * Stores logs in localStorage for debugging on deployed environments
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'debug';
  message: string;
  data?: any;
}

const MAX_LOGS = 100;
const STORAGE_KEY = 'passkey_debug_logs';

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];

  private constructor() {
    this.loadLogs();
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load debug logs:', e);
    }
  }

  private saveLogs() {
    try {
      // Keep only the last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save debug logs:', e);
    }
  }

  private addLog(level: 'info' | 'error' | 'debug', message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.serializeData(data) : undefined,
    };
    
    this.logs.push(entry);
    this.saveLogs();
    
    // Also log to console for local development
    console[level](`[DebugLogger] ${message}`, data || '');
  }

  private serializeData(data: any): any {
    try {
      // Handle ArrayBuffer and typed arrays
      if (data instanceof ArrayBuffer) {
        return {
          type: 'ArrayBuffer',
          byteLength: data.byteLength,
          preview: Array.from(new Uint8Array(data).slice(0, 20)).join(','),
        };
      }
      
      // Handle objects that might contain ArrayBuffers
      if (typeof data === 'object' && data !== null) {
        const serialized: any = Array.isArray(data) ? [] : {};
        
        for (const key in data) {
          const value = data[key];
          
          if (value instanceof ArrayBuffer) {
            serialized[key] = {
              type: 'ArrayBuffer',
              byteLength: value.byteLength,
              preview: Array.from(new Uint8Array(value).slice(0, 20)).join(','),
            };
          } else if (value && typeof value === 'object') {
            serialized[key] = this.serializeData(value);
          } else {
            serialized[key] = value;
          }
        }
        
        return serialized;
      }
      
      return data;
    } catch (e) {
      return { error: 'Failed to serialize data', message: String(e) };
    }
  }

  info(message: string, data?: any) {
    this.addLog('info', message, data);
  }

  error(message: string, data?: any) {
    this.addLog('error', message, data);
  }

  debug(message: string, data?: any) {
    this.addLog('debug', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export a singleton instance
export const debugLogger = DebugLogger.getInstance();

