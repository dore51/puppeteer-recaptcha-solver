import { Page } from 'puppeteer';
import { defaultLogger, Logger } from '../logger/logger';
import { solveCaptcha } from './solver';
import { Transcriber, witAI } from '../transcribe/transcribers';

interface ReCaptchaSolverProps {
    page: Page;
    logger?: Logger;
    transcriber?: Transcriber;
    maxRetries?: number;
    apiKey?: string;
}

class ReCaptchaSolver {
    private readonly page: Page;
    private readonly logger: Logger;
    private readonly maxRetries: number;
    private readonly transcriber: Transcriber;
    private readonly apiKey?: string;

    constructor({
        page,
        logger,
        maxRetries,
        transcriber,
        apiKey,
    }: ReCaptchaSolverProps) {
        this.page = page;
        this.logger = logger || defaultLogger;
        this.maxRetries = maxRetries || 3;
        this.transcriber = transcriber || witAI;
        this.apiKey = apiKey;
    }

    public async solve(): Promise<boolean> {
        await this.logger.info('Starting to solve captcha');
        try {
            const res = await solveCaptcha({
                page: this.page,
                logger: this.logger,
                maxRetries: this.maxRetries,
                transcriber: this.transcriber,
                apiKey: this.apiKey,
            });

            await this.logger.info(`Captcha solved: ${res}`);

            return res;
        } catch (e) {
            await this.logger.error(`Failed to solve captcha: ${e}`);
            return false;
        }
    }
}

export default ReCaptchaSolver;
