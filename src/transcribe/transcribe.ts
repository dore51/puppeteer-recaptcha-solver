import { Logger } from '../logger/logger';
import { Transcriber } from './transcribers';
import axios from 'axios';
import * as https from 'https';

interface TranscriberMP3Props {
    audioBuffer: ArrayBuffer;
    logger: Logger;
    transcriber: Transcriber;
    apiKey?: string;
}

export const transcribeAudio = async ({
    audioBuffer,
    logger,
    transcriber,
    apiKey,
}: TranscriberMP3Props) => {
    await logger.info('transcribing audio');
    try {
        const text = await transcriber(audioBuffer, apiKey);

        if (text) {
            await logger.info(`Audio transcript: ${text}`);
            return text;
        }

        await logger.warn('Audio transcript is empty');
        return null;
    } catch (e) {
        await logger.error(`Error transcribing captcha audio: ${e}`);
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
