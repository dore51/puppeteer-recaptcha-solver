export interface Logger {
    log(message: string): void | Promise<void>;
    error(message: string): void | Promise<void>;
    warn(message: string): void | Promise<void>;
    info(message: string): void | Promise<void>;
    debug(message: string): void | Promise<void>;
}

// tslint:disable: no-console
export const defaultLogger: Logger = {
    log: (message: string) => console.log('[LOG]', message),
    error: (message: string) => console.error('[ERROR]', message),
    warn: (message: string) => console.warn('[WARN]', message),
    info: (message: string) => console.info('[INFO]', message),
    debug: (message: string) => console.debug('[DEBUG]', message),
};

export const noopLogger: Logger = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
};

export const Loggers = {
    default: defaultLogger,
    noop: noopLogger,
};
