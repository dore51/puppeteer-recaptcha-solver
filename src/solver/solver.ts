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
import { downloadAudio, translateAudio } from '../translate/translate';
import { Translator } from '../translate/translators';

interface SolveCaptchaProps {
    page: Page;
    log: Logger;
    translator: Translator;
    maxRetries: number;
    apiKey: string;
}

export const solveCaptcha = async ({
    page,
    log,
    maxRetries,
    translator,
    apiKey,
}: SolveCaptchaProps) => {
    let numberOfRetries = 0;
    const captchaIframe = await switchToCaptchaIframe(log, page);
    await clickOnCheckbox(log, captchaIframe);

    const checked = await isCaptchaChecked(log, captchaIframe);

    if (!checked) {
        await log.info(
            'captcha is not checked after click, trying to solve with audio'
        );
        const imagesFrame = await switchToImagesIframe(log, page);
        await clickOnAudioButton(log, imagesFrame);
        await verifyIfBlocked(log, imagesFrame);

        while (shouldRetry(numberOfRetries, maxRetries)) {
            numberOfRetries++;
            await log.info(
                `Solving captcha, attempt ${numberOfRetries}/${maxRetries}`
            );

            const isAudioLinkExists = await isAudioLinkExist(log, imagesFrame);
            if (!isAudioLinkExists) {
                await reloadCaptcha(log, imagesFrame);
                continue;
            }

            const audioSrc = await getAudioSrc(log, imagesFrame);
            if (!audioSrc) {
                await reloadCaptcha(log, imagesFrame);
                continue;
            }

            const audioBuffer = await downloadAudio(log, audioSrc);
            if (!audioBuffer) {
                await reloadCaptcha(log, imagesFrame);
                continue;
            }

            const audioTranscript = await translateAudio({
                audioBuffer,
                log,
                translator,
                apiKey,
            });
            if (!audioTranscript) {
                await reloadCaptcha(log, imagesFrame);
                continue;
            }

            await setCaptchaText(log, imagesFrame, audioTranscript);
            await submitCaptcha(log, imagesFrame);

            const isCaptchaSolved = await isCaptchaChecked(log, captchaIframe);
            if (isCaptchaSolved) {
                await log.info('Captcha solved successfully');
                return true;
            }

            await log.warn('Captcha was not solved');

            const isMultipleSolutionErrorExists = await isMultipleSolutionError(
                log,
                imagesFrame
            );
            if (isMultipleSolutionErrorExists) {
                await log.error(
                    'Multiple solutions error, captcha cannot be solved'
                );
                return false;
            }

            if (shouldRetry(numberOfRetries, maxRetries)) {
                await reloadCaptcha(log, imagesFrame);
            }
        }
    } else {
        await log.info('Captcha is checked');
        return true;
    }

    return false;
};

const shouldRetry = (numOfRetries: number, maxRetries: number) =>
    numOfRetries < maxRetries;
