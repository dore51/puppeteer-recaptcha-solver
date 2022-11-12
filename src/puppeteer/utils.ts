import { Logger } from '../logger';
import { Frame, Page } from 'puppeteer';
import {
    clickOnElement,
    getElementAttribute,
    isElementExists,
    setText,
    switchIframe,
} from './infra';
import { Selectors } from './selectors';
import axios from 'axios';
import * as https from 'https';

export const switchToCaptchaIframe = async (log: Logger, page: Page) => {
    await log.debug('switching to captcha anchor iframe');
    return switchIframe({
        window: page,
        log,
        selector: Selectors.anchorFrame,
        WaitForSubElement: Selectors.captchaCheckBox,
    });
};

export const clickOnCheckbox = async (log: Logger, captchaIframe: Frame) => {
    await log.debug('clicking on captcha checkbox');
    await clickOnElement({
        window: captchaIframe,
        selector: Selectors.captchaCheckBox,
        log,
    });
};

export const isCaptchaChecked = async (log: Logger, captchaIframe: Frame) => {
    await log.debug('Checking if captcha is checked');
    return isElementExists({
        window: captchaIframe,
        selector: Selectors.captchaChecked,
        log,
        visible: true,
        timeout: 2000,
    });
};

export const isMultipleSolutionError = async (
    log: Logger,
    imagesIframe: Frame
) => {
    await log.debug('Checking if multiple solution error exists');
    return isElementExists({
        window: imagesIframe,
        selector: Selectors.multipleSolutionError,
        log,
        visible: true,
        timeout: 500,
    });
};

export const switchToImagesIframe = async (log: Logger, page: Page) => {
    await log.debug('switching to captcha images iframe');
    return switchIframe({
        window: page,
        log,
        selector: Selectors.captchaImagesIframe,
        WaitForSubElement: Selectors.captchaImage,
    });
};

export const clickOnAudioButton = async (log: Logger, imagesFrame: Frame) => {
    await log.debug('clicking on audio captcha button');
    await clickOnElement({
        window: imagesFrame,
        selector: Selectors.captchaAudioButton,
        log,
    });
};

export const verifyIfBlocked = async (imagesFrame: Frame, log: Logger) => {
    const isBlocked = await isElementExists({
        window: imagesFrame,
        selector: Selectors.captchaBlocked,
        log,
        visible: true,
        timeout: 1000,
    });

    if (isBlocked) {
        const error = 'You are blocked from solving captchas, try again later';
        await log.error(error);
        throw new Error(error);
    }
};

export const isAudioLinkExist = async (log: Logger, imagesFrame: Frame) => {
    await log.debug('waiting for audio link');
    const exists = isElementExists({
        window: imagesFrame,
        selector: Selectors.captchaDownloadLink,
        log,
        timeout: 5000,
    });

    if (!exists) {
        await log.warn('Audio link not found, reloading captcha');
    }

    return exists;
};

export const getAudioSrc = async (log: Logger, imagesFrame: Frame) => {
    await log.debug('getting audio src');
    const value = getElementAttribute({
        window: imagesFrame,
        selector: Selectors.captchaAudioSrc,
        attribute: 'src',
        log,
        visible: false,
    });

    if (!value) {
        await log.warn('Audio src is empty, retrying');
    }

    return value;
};

export const downloadAudio = async (
    log: Logger,
    page: Page,
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

export const setCaptchaText = async (
    log: Logger,
    imagesFrame: Frame,
    audioTranscript: string
) => {
    await log.debug('setting captcha text');
    await setText({
        window: imagesFrame,
        selector: Selectors.captchaAudioResponse,
        text: audioTranscript,
        log,
    });
};

export const submitCaptcha = async (log: Logger, imagesFrame: Frame) => {
    await log.debug('clicking on captcha submit button');
    await clickOnElement({
        window: imagesFrame,
        selector: Selectors.captchaSubmitButton,
        log,
    });
};

export const reloadCaptcha = async (frame: Frame, log: Logger) => {
    await log.debug('Reloading captcha');
    await clickOnElement({
        window: frame,
        selector: Selectors.reloadCaptchaButton,
        log,
    });
};
