import { switchIframe } from '../../src/puppeteer/infra';
import { Loggers } from '../../src';
import { Page } from 'puppeteer';

const mockSwitchIframeProps = {
    window: {
        waitForFrame: jest.fn(),
    },
    logger: Loggers.noop,
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
            const { window, logger, selector, WaitForSubElement } =
                mockSwitchIframeProps;

            window.waitForFrame.mockResolvedValue(mockFrame);
            mockFrame.waitForSelector.mockResolvedValue(true);

            const frame = await switchIframe({
                window: window as unknown as Page,
                logger,
                selector,
                WaitForSubElement,
            });
            expect(frame).toEqual(mockFrame);
        });
    });
});
