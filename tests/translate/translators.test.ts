import axios from 'axios';
import { Translators } from '../../src';

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
describe('translators', () => {
    jest.spyOn(axios, 'post').mockImplementation(mockAxiosPost);
    it('should translate audio to text', async () => {
        for (const [name, translator] of Object.entries(Translators)) {
            const response = responses[name as keyof typeof responses];
            mockAxiosPost.mockResolvedValue(response);
            const text = await translator(mockAudioBuffer, 'test-api-key');
            expect(text).toBe('test');
        }
    });

    it('should throw error if no api key is provided', async () => {
        for (const [name, translator] of Object.entries(Translators)) {
            await expect(translator(mockAudioBuffer)).rejects.toThrow(
                `${name} translator requires API key`
            );
        }
    });

    it('should parse correct text from response', async () => {
        for (const [name, translator] of Object.entries(Translators)) {
            const response = responses[name as keyof typeof responses];
            mockAxiosPost.mockResolvedValue({
                data: JSON.stringify(response.data),
            });
            const text = await translator(mockAudioBuffer, 'test-api-key');
            expect(text).toBe('test');
        }
    });

    it('should parse empty text from response', async () => {
        for (const translator of Object.values(Translators)) {
            mockAxiosPost.mockResolvedValue({
                data: '',
            });
            const text = await translator(mockAudioBuffer, 'test-api-key');
            expect(text).toBe(undefined);
        }
    });
});
