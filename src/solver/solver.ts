import { Page } from 'puppeteer';
import { Logger } from '../logger/logger';
import {
    clickOnAudioButton,
    clickOnCheckbox,
    getAudioSrc,
    isAudioLinkExist,
    isCaptchaChecked,
    isMultipleSolutionError,
    reloadCaptcha,
    setCaptchaText,
    submitCaptcha,
    switchToCaptchaIframe,
    switchToImagesIframe,
    verifyIfBlocked,
} from '../puppeteer/utils';
import { downloadAudio, transcribeAudio } from '../transcribe/transcribe';
import { Transcriber } from '../transcribe/transcribers';

interface SolveCaptchaProps {
    page: Page;
    logger: Logger;
    transcriber: Transcriber;
    maxRetries: number;
    apiKey?: string;
}

export const solveCaptcha = async ({
    page,
    logger,
    maxRetries,
    transcriber,
    apiKey,
}: SolveCaptchaProps) => {
    let numberOfRetries = 0;
    const captchaIframe = await switchToCaptchaIframe(logger, page);
    await clickOnCheckbox(logger, captchaIframe);

    const checked = await isCaptchaChecked(logger, captchaIframe);

    if (!checked) {
        await logger.info(
            'captcha is not checked after click, trying to solve with audio'
        );
        const imagesFrame = await switchToImagesIframe(logger, page);
        await clickOnAudioButton(logger, imagesFrame);
        await verifyIfBlocked(logger, imagesFrame);

        while (shouldRetry(numberOfRetries, maxRetries)) {
            numberOfRetries++;
            await logger.info(
                `Solving captcha, attempt ${numberOfRetries}/${maxRetries}`
            );

            const isAudioLinkExists = await isAudioLinkExist(
                logger,
                imagesFrame
            );
            if (!isAudioLinkExists) {
                await reloadCaptcha(logger, imagesFrame);
                continue;
            }

            const audioSrc = await getAudioSrc(logger, imagesFrame);
            if (!audioSrc) {
                await reloadCaptcha(logger, imagesFrame);
                continue;
            }

            const audioBuffer = await downloadAudio(logger, audioSrc);
            if (!audioBuffer) {
                await reloadCaptcha(logger, imagesFrame);
                continue;
            }

            const audioTranscript = await transcribeAudio({
                audioBuffer,
                logger,
                transcriber,
                apiKey,
            });
            if (!audioTranscript) {
                await reloadCaptcha(logger, imagesFrame);
                continue;
            }

            await setCaptchaText(logger, imagesFrame, audioTranscript);
            await submitCaptcha(logger, imagesFrame);

            const isCaptchaSolved = await isCaptchaChecked(
                logger,
                captchaIframe
            );
            if (isCaptchaSolved) {
                await logger.info('Captcha solved successfully');
                return true;
            }

            await logger.warn('Captcha was not solved');

            const isMultipleSolutionErrorExists = await isMultipleSolutionError(
                logger,
                imagesFrame
            );
            if (isMultipleSolutionErrorExists) {
                await logger.error(
                    'Multiple solutions error, captcha cannot be solved'
                );
                return false;
            }

            if (shouldRetry(numberOfRetries, maxRetries)) {
                await reloadCaptcha(logger, imagesFrame);
            }
        }
    } else {
        await logger.info('Captcha is checked');
        return true;
    }

    return false;
};

const shouldRetry = (numOfRetries: number, maxRetries: number) =>
    numOfRetries < maxRetries;
