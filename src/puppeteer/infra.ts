import { Frame } from 'puppeteer';
import {
    BaseProps,
    FuncProps,
    GetAttributeProps,
    SetTextProps,
    SwitchFrameProps,
    WaitForSelectorProps,
} from './types';

const DefaultTimeout = {
    SwitchFrame: 5000,
    ClickOnElement: 2000,
    SetText: 2000,
    GetAttribute: 2000,
};

export const switchIframe = async ({
    window,
    logger,
    selector,
    WaitForSubElement,
}: SwitchFrameProps): Promise<Frame> => {
    try {
        await logger.debug(`waiting for iframe "${selector.name}"`);
        const frame = await window.waitForFrame(
            (f) => f.url().includes(selector.value),
            {
                timeout: DefaultTimeout.SwitchFrame,
            }
        );
        await logger.debug(`found iframe "${selector.name}"`);
        await logger.debug(
            `waiting for sub element "${WaitForSubElement.name}"`
        );

        window.on('framenavigated', (frame) => {
            logger.debug(`frame navigated to ${frame.url()}`);
        });

        window.on('frameattached', (frame) => {
            logger.debug(`frame attached ${frame.url()}`);
        });

        return frame;
    } catch (e) {
        await logger.error(
            `Failed to switch to iframe "${selector.name}": ${e}`
        );
        throw e;
    }
};

export const waitForSelector = async ({
    window,
    logger,
    selector,
    timeout,
    visible = true,
}: WaitForSelectorProps) => {
    try {
        await logger.debug(`waiting to find "${selector.name}"`);
        await window.waitForSelector(selector.value, {
            timeout,
            visible,
        });
        await logger.debug(`found "${selector.name}"`);
    } catch (e) {
        await logger.error(`Failed to find element: "${selector.name}": ${e}`);
        throw e;
    }
};

export const isElementExists = async (
    props: WaitForSelectorProps
): Promise<boolean> => {
    const { logger, selector } = props;
    try {
        await logger.debug(
            `checking if element "${selector.name}" exists and visible`
        );
        await waitForSelector({
            ...props,
        });
        await logger.debug(`element "${selector.name}" exists and visible`);
        return true;
    } catch (e) {
        await logger.debug(`element "${selector.name}" does not exist`);
        return false;
    }
};

const safeExecute = async <T>(
    props: FuncProps,
    timeout: number,
    fn: () => Promise<T>
): Promise<T> => {
    await waitForSelector({ ...props, timeout });
    return fn();
};

export const clickOnElement = async (props: BaseProps) => {
    const { window, logger, selector } = props;

    const clickFunction = async (): Promise<void> => {
        try {
            await logger.debug(`clicking on element "${selector.name}"`);
            await window.click(selector.value);
        } catch (e) {
            await logger.error(
                `Failed to click on element: "${selector.name}": ${e}`
            );
            throw e;
        }
    };

    return safeExecute(props, DefaultTimeout.ClickOnElement, clickFunction);
};

export const setText = async (props: SetTextProps) => {
    const { window, logger, selector, text } = props;

    const setTextFunction = async () => {
        try {
            await logger.debug(
                `setting text on element "${selector.name}": ${text}`
            );
            await window.type(selector.value, text);
        } catch (e) {
            await logger.error(
                `Failed to set text on element: "${selector.name}": ${e}`
            );
            throw e;
        }
    };

    return safeExecute(props, DefaultTimeout.SetText, setTextFunction);
};

export const getElementAttribute = async (
    props: GetAttributeProps
): Promise<string | null> => {
    const { window, logger, selector, attribute } = props;

    const getAttributeFunction = async () => {
        try {
            await logger.debug(
                `getting attribute "${attribute}" on element "${selector.name}"`
            );
            const value = await window.$eval(
                selector.value,
                (el, attr) => el.getAttribute(attr),
                attribute
            );
            await logger.debug(
                `got attribute "${attribute}" on element "${selector.name}": ${value}`
            );
            return value;
        } catch (e) {
            await logger.error(
                `Failed to get attribute "${attribute}" on element: "${selector.name}": ${e}`
            );
            throw e;
        }
    };

    return safeExecute(
        props,
        DefaultTimeout.GetAttribute,
        getAttributeFunction
    );
};
