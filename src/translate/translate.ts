import { Logger } from '../logger/logger';
import { Translator } from './translators';
import axios from 'axios';
import * as https from 'https';

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

export const downloadAudio = async (
    log: Logger,
    audioSrc: string
): Promise<ArrayBuffer | null> => {
    await log.debug('downloading audio');
    try {
        const res = await axios.get<ArrayBuffer>(audioSrc, {
            responseType: 'arraybuffer',
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        return res.data;
    } catch (e) {
        await log.warn(`Failed to download audio: ${e}`);
        return null;
    }
};
