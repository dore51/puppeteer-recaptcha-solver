import { Page } from 'puppeteer';
import { Logger } from './logger';
import {
    clickOnAudioButton,
    clickOnCheckbox,
    downloadAudio,
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
} from './puppeteer/utils';
import { translateMP3 } from './translate/translate';
import { Translator } from './translate/translators';

interface ExecuteProps {
    page: Page;
    log: Logger;
    translator: Translator;
    maxRetries: number;
    apiKey: string;
}
export const bypassCaptcha = async ({
    page,
    log,
    maxRetries,
    translator,
    apiKey,
}: ExecuteProps) => {
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
        await verifyIfBlocked(imagesFrame, log);

        while (shouldRetry(numberOfRetries, maxRetries)) {
            numberOfRetries++;
            await log.info(
                `Solving captcha, attempt ${numberOfRetries}/${maxRetries}`
            );

            const isAudioLinkExists = await isAudioLinkExist(log, imagesFrame);
            if (!isAudioLinkExists) {
                await reloadCaptcha(imagesFrame, log);
                continue;
            }

            const audioSrc = await getAudioSrc(log, imagesFrame);
            if (!audioSrc) {
                await reloadCaptcha(imagesFrame, log);
                continue;
            }

            const audioBuffer = await downloadAudio(log, page, audioSrc);
            if (!audioBuffer) {
                await reloadCaptcha(imagesFrame, log);
                continue;
            }

            const audioTranscript = await translateMP3({
                audioBuffer,
                log,
                translator,
                apiKey,
            });
            if (!audioTranscript) {
                await reloadCaptcha(imagesFrame, log);
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
                await reloadCaptcha(imagesFrame, log);
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
