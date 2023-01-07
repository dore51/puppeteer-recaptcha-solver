import * as puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import ReCaptchaSolver from '../src';
import { Transcribers } from '../src';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    const solver = new ReCaptchaSolver({
        page,
        maxRetries: 3,
        transcriber: Transcribers.witAI,
        apiKey: '<YOUR_API_KEY>',
    });

    await page.goto(
        'https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php'
    );
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./example/example.mp4');

    const solved = await solver.solve();
    await recorder.stop();

    console.log('Captcha solved: ', solved);
    await page.screenshot({ path: 'example/example.png' });
    await browser.close();
})();
