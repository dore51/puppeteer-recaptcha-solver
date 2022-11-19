import { Translator } from '../../src/translate/translators';
import { Page } from 'puppeteer';
import CaptchaBypass, { Loggers, Translators } from '../../src/';
import * as bypassCaptcha from '../../src/solver/solver';

const mockPage: Page = {} as Page;
const mockLogger = Loggers.noop;
const mockTranslator: Translator = jest.fn();
const mockBypass = jest.fn();

jest.spyOn(bypassCaptcha, 'solveCaptcha').mockImplementation(mockBypass);

describe('CaptchaBypass', () => {
    let captchaBypass: CaptchaBypass;
    beforeEach(() => {
        captchaBypass = new CaptchaBypass({
            page: mockPage,
            logger: mockLogger,
            translator: mockTranslator,
            maxRetries: 1,
            apiKey: 'test-api-key',
        });
    });

    it('should create instance of CaptchaBypass', () => {
        expect(captchaBypass).toBeInstanceOf(CaptchaBypass);
        expect(captchaBypass).toHaveProperty('solve');
    });

    it('should execute bypassCaptcha', async () => {
        mockBypass.mockResolvedValue(true);
        const res = await captchaBypass.solve();
        expect(res).toBe(true);
        expect(mockBypass).toBeCalledWith({
            page: mockPage,
            logger: mockLogger,
            translator: mockTranslator,
            maxRetries: 1,
            apiKey: 'test-api-key',
        });
    });

    it('should return false if bypassCaptcha throws error', async () => {
        mockBypass.mockRejectedValue('test');
        const res = await captchaBypass.solve();
        expect(res).toBe(false);
    });

    it('should check constructor default values', async () => {
        const defaultCaptchaByPass = new CaptchaBypass({
            page: mockPage,
            apiKey: 'test-api-key',
        });

        await defaultCaptchaByPass.solve();
        expect(mockBypass).toBeCalledWith({
            page: mockPage,
            logger: Loggers.default,
            maxRetries: 3,
            translator: Translators.witAI,
            apiKey: 'test-api-key',
        });
    });
});
