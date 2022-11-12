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
