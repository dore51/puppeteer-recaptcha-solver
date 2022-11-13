import * as puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import CaptchaBypass from '../src/CaptchaBypass';
import { translators } from '../src';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    const bypassCaptcha = new CaptchaBypass({
        page,
        maxRetries: 3,
        translator: translators.witAI,
    });

    await page.goto(
        'https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php'
    );
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./example/example.mp4');

    const solved = await bypassCaptcha.execute(
        'WMDYPCJNOP5Q4BO4QFKD4RNMZL37MJJZ' //'AIzaSyDWVUzHGu8HTzg8USjTq-Kii6cJ5yTuS28' //'WMDYPCJNOP5Q4BO4QFKD4RNMZL37MJJZ' //'JVHWCNWJLWLGN6MFALYLHAPKUFHMNTAC'
    );
    await recorder.stop();

    console.log('Captcha solved: ', solved);
    await page.screenshot({ path: 'example/example.png' });
    await browser.close();
})();
