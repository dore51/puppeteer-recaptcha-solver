import { Frame, Page } from 'puppeteer';
import { Logger } from '../logger/logger';
import { Selector } from './selector';

export type Window = Page | Frame;
export interface BaseProps {
    window: Window;
    log: Logger;
    selector: Selector;
}
export type SwitchFrameProps = BaseProps & {
    window: Page;
    WaitForSubElement: Selector;
};
export type SetTextProps = BaseProps & { text: string };
export type WaitForSelectorProps = BaseProps & {
    visible?: boolean;
    timeout: number;
};
export type GetAttributeProps = BaseProps & {
    attribute: string;
    visible?: boolean;
};
export type FuncProps =
    | BaseProps
    | SwitchFrameProps
    | SetTextProps
    | WaitForSelectorProps;
