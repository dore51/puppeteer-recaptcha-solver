import { Loggers } from '../../src';

describe('Logger', () => {
    it('should log defaultLogger to the console', async () => {
        const logger = Loggers.default;
        Object.entries(logger).forEach(([key, method]) => {
            expect(method).toBeDefined();
            const spy = jest
                .spyOn(console, key as any)
                .mockImplementationOnce(() => {});

            method('test');
            expect(spy).toHaveBeenCalledWith(`[${key.toUpperCase()}]`, 'test');
        });
    });
});
