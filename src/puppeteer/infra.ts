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
    log,
    selector,
    WaitForSubElement,
}: SwitchFrameProps): Promise<Frame> => {
    try {
        await log.debug(`waiting for iframe "${selector.name}"`);
        const frame = await window.waitForFrame(
            (f) => f.url().includes(selector.value),
            {
                timeout: DefaultTimeout.SwitchFrame,
            }
        );
        await log.debug(`found iframe "${selector.name}"`);
        await log.debug(`waiting for sub element "${WaitForSubElement.name}"`);

        await frame.waitForSelector(WaitForSubElement.value, {
            timeout: DefaultTimeout.SwitchFrame,
        });

        return frame;
    } catch (e) {
        await log.error(`Failed to switch to iframe "${selector.name}": ${e}`);
        throw e;
    }
};

export const waitForSelector = async ({
    window,
    log,
    selector,
    timeout,
    visible = true,
}: WaitForSelectorProps) => {
    try {
        await log.debug(`waiting to find "${selector.name}"`);
        await window.waitForSelector(selector.value, {
            timeout,
            visible,
        });
        await log.debug(`found "${selector.name}"`);
    } catch (e) {
        await log.error(`Failed to find element: "${selector.name}": ${e}`);
        throw e;
    }
};

export const isElementExists = async (
    props: WaitForSelectorProps
): Promise<boolean> => {
    const { log, selector } = props;
    try {
        await log.debug(
            `checking if element "${selector.name}" exists and visible`
        );
        await waitForSelector({
            ...props,
        });
        await log.debug(`element "${selector.name}" exists and visible`);
        return true;
    } catch (e) {
        await log.debug(`element "${selector.name}" does not exist`);
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
    const { window, log, selector } = props;

    const clickFunction = async (): Promise<void> => {
        try {
            await log.debug(`clicking on element "${selector.name}"`);
            await window.click(selector.value);
        } catch (e) {
            await log.error(
                `Failed to click on element: "${selector.name}": ${e}`
            );
            throw e;
        }
    };

    return safeExecute(props, DefaultTimeout.ClickOnElement, clickFunction);
};

export const setText = async (props: SetTextProps) => {
    const { window, log, selector, text } = props;

    const setTextFunction = async () => {
        try {
            await log.debug(
                `setting text on element "${selector.name}": ${text}`
            );
            await window.type(selector.value, text);
        } catch (e) {
            await log.error(
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
    const { window, log, selector, attribute } = props;

    const getAttributeFunction = async () => {
        try {
            await log.debug(
                `getting attribute "${attribute}" on element "${selector.name}"`
            );
            const value = await window.$eval(
                selector.value,
                (el, attr) => el.getAttribute(attr),
                attribute
            );
            await log.debug(
                `got attribute "${attribute}" on element "${selector.name}": ${value}`
            );
            return value;
        } catch (e) {
            await log.error(
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
