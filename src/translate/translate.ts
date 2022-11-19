import { Logger } from '../logger/logger';
import { Translator } from './translators';
import axios from 'axios';
import * as https from 'https';

interface TranslateMP3Props {
    audioBuffer: ArrayBuffer;
    logger: Logger;
    translator: Translator;
    apiKey?: string;
}

export const translateAudio = async ({
    audioBuffer,
    logger,
    translator,
    apiKey,
}: TranslateMP3Props) => {
    await logger.info('translating audio');
    try {
        const text = await translator(audioBuffer, apiKey);

        if (text) {
            await logger.info(`Audio transcript: ${text}`);
            return text;
        }

        await logger.warn('Audio transcript is empty');
        return null;
    } catch (e) {
        await logger.error(`Error translating captcha audio: ${e}`);
        return null;
    }
};

export const downloadAudio = async (
    logger: Logger,
    audioSrc: string
): Promise<ArrayBuffer | null> => {
    await logger.debug('downloading audio');
    try {
        const res = await axios.get<ArrayBuffer>(audioSrc, {
            responseType: 'arraybuffer',
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return res.data;
    } catch (e) {
        await logger.warn(`Failed to download audio: ${e}`);
        return null;
    }
};
