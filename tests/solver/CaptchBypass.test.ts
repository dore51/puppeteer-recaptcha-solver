import { Translator } from '../../src/translate/translators';
import { Page } from 'puppeteer';
import CaptchaBypass, { Loggers, translators } from '../../src/';
import * as bypassCaptcha from '../../src/solver/bypass';

const mockPage: Page = {} as Page;
const mockLogger = Loggers.noop;
const mockTranslator: Translator = jest.fn();
const mockBypass = jest.fn();

jest.spyOn(bypassCaptcha, 'bypassCaptcha').mockImplementation(mockBypass);

describe('CaptchaBypass', () => {
    let captchaBypass: CaptchaBypass;
    beforeEach(() => {
        captchaBypass = new CaptchaBypass({
            page: mockPage,
            log: mockLogger,
            translator: mockTranslator,
            maxRetries: 1,
        });
    });

    it('should create instance of CaptchaBypass', () => {
        expect(captchaBypass).toBeInstanceOf(CaptchaBypass);
        expect(captchaBypass).toHaveProperty('execute');
    });

    it('should execute bypassCaptcha', async () => {
        mockBypass.mockResolvedValue(true);
        const res = await captchaBypass.execute('test-api-key');
        expect(res).toBe(true);
        expect(mockBypass).toBeCalledWith({
            page: mockPage,
            log: mockLogger,
            translator: mockTranslator,
            maxRetries: 1,
            apiKey: 'test-api-key',
        });
    });

    it('should return false if bypassCaptcha throws error', async () => {
        mockBypass.mockRejectedValue('test');
        const res = await captchaBypass.execute('test-api-key');
        expect(res).toBe(false);
    });

    it('should check constructor default values', async () => {
        const defaultCaptchaByPass = new CaptchaBypass({
            page: mockPage,
        });

        await defaultCaptchaByPass.execute('test-api-key');
        expect(mockBypass).toBeCalledWith({
            page: mockPage,
            log: Loggers.default,
            maxRetries: 3,
            translator: translators.witAI,
            apiKey: 'test-api-key',
        });
    });
});
