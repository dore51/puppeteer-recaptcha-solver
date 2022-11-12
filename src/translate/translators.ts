import axios from 'axios';

export type Translator = (
    audioBuffer: ArrayBuffer,
    apiKey?: string
) => Promise<string | null>;

export const witAI: Translator = async (
    audioBuffer: ArrayBuffer,
    apiKey?: string
) => {
    if (!apiKey) {
        throw new Error('witAI translator requires API key');
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
};

export const googleSpeechToText: Translator = async (
    audioBuffer: ArrayBuffer,
    apiKey?: string
) => {
    if (!apiKey) {
        throw new Error('googleSpeechToText translator requires API key');
    }

    const { data } = await axios.post<string>(
        'https://speech.googleapis.com/v1/speech:recognize',
        {
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            },
            audio: {
                content: Buffer.from(audioBuffer).toString('base64'),
            },
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    console.log('google data', data);

    const parsed =
        typeof data === 'string'
            ? JSON.parse(data.split('\r\n').slice(-1)[0] || '{}')
            : data;

    return parsed?.results?.[0]?.alternatives?.[0]?.transcript;
};

export const translators = {
    witAI,
    googleSpeechToText,
};
