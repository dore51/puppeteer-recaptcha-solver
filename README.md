[![npm version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&r=r&type=6e&v=1.0.0&x2=0)](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&r=r&type=6e&v=1.0.0&x2=0)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)


# puppeteer-recaptcha-solver

> Google Recapctha v2 solver with puppeteer. You can simply use it in your project by passing to the constructor your `Page` object.
> The solver is using SpeechToText recognition, you can use one of our integrated solvers with your API key or to provide your own solving function.
> You can also integrate your own logger.

#### Disclaimer

> This is an academic project, it is not intended to be used in production. It is not
> recommended to use this project for any other purpose than
> educational. The author is not responsible for any misuse of this
> project.

## Demo

https://user-images.githubusercontent.com/63049090/209352713-c3263dc8-0c37-4786-b28f-0af997b3b60e.mp4

## Table of contents

- [Puppeteer Recaptcha Solver](#puppeteer-recaptcha-solver)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Constructor](#constructor)
    - [Solve](#solve)
    - [General Types](#general-types)
      - [Examples](#examples)
        - [Default Logger](#default-logger)
        - [WitAI Transcriber](#witai-transcriber)
        - [Google SpeechToText Transcriber](#google-speechtotext-transcriber)
  - [Contributing](#contributing)
  - [Built With](#built-with)
  - [Authors](#authors)
  - [License](#license)

## Prerequisites

This project requires NodeJS (version 8 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)


To install and set up the library, run:

```sh
$ npm install @dore51/puppeteer-recaptcha-solver
```

# Usage

To use, simply create the object and execute the `solve` command.

Example:

```ts
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    const solver = new ReCaptchaSolver({
        page,
        maxRetries: 3,
        transcriber: Transcribers.witAI,
        apiKey: 'YOUR_API_KEY'
    });

    await page.goto(
        'https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php'
    );

    const solved = await solver.solve();

    console.log('Captcha solved: ', solved);
    await page.screenshot({ path: 'example/example.png' });
    await browser.close();
})();
```

## API

### Constructor

```ts
 const solver = new ReCaptchaSolver({
      page,
      log,
      maxRetries: 3,
      transcriber: Transcribers.witAI,
      apiKey: 'YOUR_API_KEY'
});
```

A constructor to the object.

#### Fields

Supported options for the `constructor` field are listed below.

| Field | Type        | Default value | Required | Description                                                                                                                                                                                                                                   |
| --- |-------------| --- | --- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| page | Page        |  | Yes | puppeteer page object                                                                                                                                                                                                                         |
| log | Logger      | `console.log` | No | A logger that the solver will use. You can also use the default logger or `noopLogger` to disable the logs                                                                                                                                    |  
| transcriber | Transcriber | witAI | No | A transcriber that the solver will use to transcriber the audio to text. You can can choose between witAI or googleSpeechToText by passing `Transcribers.witAI` or `Transcribers.googeSpeechToText` or passing you own `Transcriber` function. |
| maxRetries | number      | 3 | No | Total number of retries until the captcha is solved                                                                                                                                                                                           |
| apiKey | string      | | No | API key to your transcribe service                                                                                                                                                                                                            | 


### Solve

```ts
const solved: boolean = await solver.solve();
```

A command that will start the solving process.
Returns a `Promise<boolean>` to indicate if the captcha successfully solved.

# General Types

| Type        | Signature                                                                                              | Description                                          |
|-------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| Logger      | <pre>interface Logger {<br>  log(message: string): void \| Promise\<void\>;<br>  error(message: string): void \| Promise\<void\>;<br>  warn(message: string): void \| Promise\<void\>;<br>  info(message: string): void \| Promise\<void\>;<br>  debug(message: string): void \| Promise\<void\>;<br>}</pre> | A logger object that the solver will use. |
| Transcriber | <pre>type Transcriber = (<br>  audioBuffer: ArrayBuffer,<br>  apiKey?: string<br>) => Promise\<string \| null\>;</pre>                                        | A transcribe function that gets an `ArrayBuffer` and should return the text |


## Examples

### default Logger

```ts
const defaultLogger: Logger = {
    log: (message: string) => console.log('[LOG]', message),
    error: (message: string) => console.error('[ERROR]', message),
    warn: (message: string) => console.warn('[WARN]', message),
    info: (message: string) => console.info('[INFO]', message),
    debug: (message: string) => console.debug('[DEBUG]', message),
};
```

### witAI Transcriber

```ts
const witAI: Transcriber = async (
    audioBuffer: ArrayBuffer,
    apiKey?: string
) => {
    if (!apiKey) {
        throw new Error('witAI transcriber requires API key');
    }

    const { data } = await axios.post<string>(
        'https://api.wit.ai/speech?v=20220622',
        audioBuffer,
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'audio/mpeg3',
            },
        }
    );

    const parsed =
        typeof data === 'string'
            ? JSON.parse(data.split('\r\n').slice(-1)[0] || '{}')
            : data;

    return parsed?.text;
}
```

### Google SpeechToText Transcriber

```ts
const googleSpeechToText: Transcriber = async (
    audioBuffer: ArrayBuffer,
    apiKey?: string
) => {
    if (!apiKey) {
        throw new Error('googleSpeechToText transcriber requires API key');
    }

    const { data } = await axios.post<string>(
        `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`,
        {
            config: {
                encoding: 'MP3',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            },
            audio: {
                content: Buffer.from(audioBuffer).toString('base64'),
            },
        }
    );

    const parsed =
        typeof data === 'string'
            ? JSON.parse(data.split('\r\n').slice(-1)[0] || '{}')
            : data;

    return parsed?.results?.[0]?.alternatives?.[0]?.transcript;
};
```


## Contributing

Start with cloning this repo on your local machine:

```sh
$ git clone https://github.com/dore51/puppeteer-captcha-solver.git
$ cd puppeteer-captcha-solver
```

To install and set up the library, run:

```sh
$ npm install
```

### To check that everything works

```sh
$ npm run example
```

### Running the tests

```sh
$ npm test
```

### Building a distribution version

```sh
$ npm run build
```

This task will create a distribution version of the project
inside your local `lib/` folder

### publishing the distribution version

```sh
$ npm publish
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:


## Built With

* node
* puppeteer 
* prettier
* axios
* jest
* puppeteer-screen-recorder
* tslint


## Authors

* **Dor Eitan** - [Github](https://github.com/dore51)

See also the list of [contributors](https://github.com/dore51/puppeteer-recptcha-solver/contributors) who participated in this project.

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Dor Eitan
