import { switchIframe } from '../../src/puppeteer/infra';
import { Loggers } from '../../src';
import { Page } from 'puppeteer';

const mockSwitchIframeProps = {
    window: {
        waitForFrame: jest.fn(),
    },
    log: Loggers.noop,
    selector: {
        name: 'selector',
        value: 'selector',
    },
    WaitForSubElement: {
        name: 'WaitForSubElement',
        value: 'WaitForSubElement',
    },
};
const mockFrame = {
    waitForSelector: jest.fn(),
};
describe('infra', () => {
    describe('switchIframe', () => {
        it('should switch to iframe', async () => {
            const { window, log, selector, WaitForSubElement } =
                mockSwitchIframeProps;

            window.waitForFrame.mockResolvedValue(mockFrame);
            mockFrame.waitForSelector.mockResolvedValue(true);

            const frame = await switchIframe({
                window: window as unknown as Page,
                log,
                selector,
                WaitForSubElement,
            });
            expect(frame).toEqual(mockFrame);
        });
    });
});
