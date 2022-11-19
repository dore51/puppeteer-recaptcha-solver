import { Logger } from '../logger/logger';
import { Frame, Page } from 'puppeteer';
import {
    clickOnElement,
    getElementAttribute,
    isElementExists,
    setText,
    switchIframe,
} from './infra';
import { Selectors } from './selectors';

export const switchToCaptchaIframe = async (logger: Logger, page: Page) => {
    await logger.debug('switching to captcha anchor iframe');
    return switchIframe({
        window: page,
        logger,
        selector: Selectors.anchorFrame,
        WaitForSubElement: Selectors.captchaCheckBox,
    });
};

export const clickOnCheckbox = async (logger: Logger, captchaIframe: Frame) => {
    await logger.debug('clicking on captcha checkbox');
    await clickOnElement({
        window: captchaIframe,
        selector: Selectors.captchaCheckBox,
        logger,
    });
};

export const isCaptchaChecked = async (
    logger: Logger,
    captchaIframe: Frame
) => {
    await logger.debug('Checking if captcha is checked');
    return isElementExists({
        window: captchaIframe,
        selector: Selectors.captchaChecked,
        logger,
        visible: true,
        timeout: 2000,
    });
};

export const isMultipleSolutionError = async (
    logger: Logger,
    imagesIframe: Frame
) => {
    await logger.debug('Checking if multiple solution error exists');
    return isElementExists({
        window: imagesIframe,
        selector: Selectors.multipleSolutionError,
        logger,
        visible: true,
        timeout: 500,
    });
};

export const switchToImagesIframe = async (logger: Logger, page: Page) => {
    await logger.debug('switching to captcha images iframe');
    return switchIframe({
        window: page,
        logger,
        selector: Selectors.captchaImagesIframe,
        WaitForSubElement: Selectors.captchaImage,
    });
};

export const clickOnAudioButton = async (
    logger: Logger,
    imagesFrame: Frame
) => {
    await logger.debug('clicking on audio captcha button');
    await clickOnElement({
        window: imagesFrame,
        selector: Selectors.captchaAudioButton,
        logger,
    });
};

export const verifyIfBlocked = async (logger: Logger, imagesFrame: Frame) => {
    const isBlocked = await isElementExists({
        window: imagesFrame,
        selector: Selectors.captchaBlocked,
        logger,
        visible: true,
        timeout: 1000,
    });

    if (isBlocked) {
        const error = 'You are blocked from solving captchas, try again later';
        await logger.error(error);
        throw new Error(error);
    }
};

export const isAudioLinkExist = async (logger: Logger, imagesFrame: Frame) => {
    await logger.debug('waiting for audio link');
    const exists = isElementExists({
        window: imagesFrame,
        selector: Selectors.captchaDownloadLink,
        logger,
        timeout: 5000,
    });

    if (!exists) {
        await logger.warn('Audio link not found, reloading captcha');
    }

    return exists;
};

export const getAudioSrc = async (logger: Logger, imagesFrame: Frame) => {
    await logger.debug('getting audio src');
    const value = getElementAttribute({
        window: imagesFrame,
        selector: Selectors.captchaAudioSrc,
        attribute: 'src',
        logger,
        visible: false,
    });

    if (!value) {
        await logger.warn('Audio src is empty, retrying');
    }

    return value;
};

export const setCaptchaText = async (
    logger: Logger,
    imagesFrame: Frame,
    audioTranscript: string
) => {
    await logger.debug('setting captcha text');
    await setText({
        window: imagesFrame,
        selector: Selectors.captchaAudioResponse,
        text: audioTranscript,
        logger,
    });
};

export const submitCaptcha = async (logger: Logger, imagesFrame: Frame) => {
    await logger.debug('clicking on captcha submit button');
    await clickOnElement({
        window: imagesFrame,
        selector: Selectors.captchaSubmitButton,
        logger,
    });
};

export const reloadCaptcha = async (logger: Logger, frame: Frame) => {
    await logger.debug('Reloading captcha');
    await clickOnElement({
        window: frame,
        selector: Selectors.reloadCaptchaButton,
        logger,
    });
};
