import { Page } from 'puppeteer';
import { defaultLogger, Logger } from '../logger/logger';
import { solveCaptcha } from './solver';
import { Translator, witAI } from '../translate/translators';

interface ReCaptchaSolverProps {
    page: Page;
    log?: Logger;
    translator?: Translator;
    maxRetries?: number;
}

class ReCaptchaSolver {
    private readonly page: Page;
    private readonly log: Logger;
    private readonly maxRetries: number;
    private readonly translator: Translator;

    constructor({ page, log, maxRetries, translator }: ReCaptchaSolverProps) {
        this.page = page;
        this.log = log || defaultLogger;
        this.maxRetries = maxRetries || 3;
        this.translator = translator || witAI;
    }

    public async solve(apiKey: string): Promise<boolean> {
        await this.log.info('Starting to solve captcha');
        try {
            const res = await solveCaptcha({
                page: this.page,
                log: this.log,
                maxRetries: this.maxRetries,
                translator: this.translator,
                apiKey,
            });

            await this.log.info(`Captcha solved: ${res}`);

            return res;
        } catch (e) {
            await this.log.error(`Failed to solve captcha: ${e}`);
            return false;
        }
    }
}

export default ReCaptchaSolver;
