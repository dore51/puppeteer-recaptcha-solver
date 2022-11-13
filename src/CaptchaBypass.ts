import { Page } from 'puppeteer';
import { defaultLogger, Logger } from './logger/logger';
import { bypassCaptcha } from './bypass';
import { Translator, witAI } from './translate/translators';

interface CaptchaBypassProps {
    page: Page;
    log?: Logger;
    translator?: Translator;
    maxRetries?: number;
}

class CaptchaBypass {
    private readonly page: Page;
    private readonly log: Logger;
    private readonly maxRetries: number;
    private readonly translator: Translator;

    constructor({ page, log, maxRetries, translator }: CaptchaBypassProps) {
        this.page = page;
        this.log = log || defaultLogger;
        this.maxRetries = maxRetries || 3;
        this.translator = translator || witAI;
    }

    public async execute(apiKey: string): Promise<boolean> {
        await this.log.info('Starting Bypassing captcha');
        try {
            const res = await bypassCaptcha({
                page: this.page,
                log: this.log,
                maxRetries: this.maxRetries,
                translator: this.translator,
                apiKey,
            });

            await this.log.info(`Captcha solved: ${res}`);

            return res;
        } catch (e) {
            await this.log.error(`Failed to bypass captcha: ${e}`);
            return false;
        }
    }
}

export default CaptchaBypass;
