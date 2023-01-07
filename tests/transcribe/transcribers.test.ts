import axios from 'axios';
import { Transcribers } from '../../src';

const mockAudioBuffer = Buffer.from('test');
const mockAxiosPost = jest.fn();
export const responses = {
    witAI: {
        data: {
            text: 'test',
        },
    },
    googleSpeechToText: {
        data: {
            results: [
                {
                    alternatives: [
                        {
                            transcript: 'test',
                        },
                    ],
                },
            ],
        },
    },
};
describe('transcribers', () => {
    jest.spyOn(axios, 'post').mockImplementation(mockAxiosPost);
    it('should transcribe audio to text', async () => {
        for (const [name, transcriber] of Object.entries(Transcribers)) {
            const response = responses[name as keyof typeof responses];
            mockAxiosPost.mockResolvedValue(response);
            const text = await transcriber(mockAudioBuffer, 'test-api-key');
            expect(text).toBe('test');
        }
    });

    it('should throw error if no api key is provided', async () => {
        for (const [name, transcriber] of Object.entries(Transcribers)) {
            await expect(transcriber(mockAudioBuffer)).rejects.toThrow(
                `${name} transcriber requires API key`
            );
        }
    });

    it('should parse correct text from response', async () => {
        for (const [name, transcriber] of Object.entries(Transcribers)) {
            const response = responses[name as keyof typeof responses];
            mockAxiosPost.mockResolvedValue({
                data: JSON.stringify(response.data),
            });
            const text = await transcriber(mockAudioBuffer, 'test-api-key');
            expect(text).toBe('test');
        }
    });

    it('should parse empty text from response', async () => {
        for (const transcriber of Object.values(Transcribers)) {
            mockAxiosPost.mockResolvedValue({
                data: '',
            });
            const text = await transcriber(mockAudioBuffer, 'test-api-key');
            expect(text).toBe(undefined);
        }
    });
});
