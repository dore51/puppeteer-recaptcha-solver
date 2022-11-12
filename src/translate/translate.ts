import { Logger } from '../logger';
import { Translator } from './translators';

interface TranslateMP3Props {
    audioBuffer: ArrayBuffer;
    log: Logger;
    translator: Translator;
    apiKey?: string;
}

export const translateMP3 = async ({
    audioBuffer,
    log,
    translator,
    apiKey,
}: TranslateMP3Props) => {
    await log.info('translating audio');
    try {
        const text = await translator(audioBuffer, apiKey);

        if (text) {
            await log.info(`Audio transcript: ${text}`);
            return text;
        }

        await log.warn('Audio transcript is empty');
        return null;
    } catch (e) {
        await log.error(`Error translating captcha audio: ${e}`);
        return null;
    }
};
