import { Selector } from './selector';

export class Selectors {
    static readonly anchorFrame = new Selector('api2/anchor', 'captcha iframe');

    static readonly captchaCheckBox = new Selector(
        '#recaptcha-anchor',
        'captcha checkbox'
    );

    static readonly captchaChecked = new Selector(
        '.recaptcha-checkbox-checked',
        'captcha checked'
    );

    static readonly captchaImagesIframe = new Selector(
        'api2/bframe',
        'captcha images iframe'
    );

    static readonly captchaAudioButton = new Selector(
        '#recaptcha-audio-button',
        'captcha audio button'
    );

    static readonly captchaAudioSrc = new Selector(
        '[id="audio-source"]',
        'captcha audio link'
    );

    static readonly captchaImage = new Selector(
        '.rc-image-tile-wrapper img',
        'captcha image'
    );

    static readonly captchaDownloadLink = new Selector(
        '.rc-audiochallenge-tdownload-link',
        'captcha download link'
    );

    static readonly reloadCaptchaButton = new Selector(
        '[id="recaptcha-reload-button"]',
        'reload captcha button'
    );

    static readonly captchaAudioResponse = new Selector(
        '[id="audio-response"]',
        'captcha audio response'
    );

    static readonly captchaSubmitButton = new Selector(
        "[id='recaptcha-verify-button']",
        'captcha audio submit'
    );

    static readonly captchaBlocked = new Selector(
        '.rc-doscaptcha-body-text',
        'captcha blocked'
    );

    static readonly multipleSolutionError = new Selector(
        '.rc-audiochallenge-error-message',
        'multiple solution error'
    );
}
