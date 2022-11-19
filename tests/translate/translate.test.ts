import { Logger } from '../../src';
import { translateAudio, downloadAudio } from '../../src/translate/translate';
import axios from 'axios';

const mockAudioBuffer = Buffer.from('test');
const mockLogger: Logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
const mockTranslator = jest.fn();
const mockAxiosGet = jest.fn();

describe('translate service', () => {
    describe('translateAudio', () => {
        const props = {
            audioBuffer: mockAudioBuffer,
            logger: mockLogger,
            translator: mockTranslator,
        };

        it('should translate audio to text without API key', async () => {
            mockTranslator.mockResolvedValue('test');
            const text = await translateAudio(props);
            expect(text).toBe('test');
            expect(mockTranslator).toBeCalledWith(mockAudioBuffer, undefined);
        });

        it('should translate audio to text with API key', async () => {
            mockTranslator.mockResolvedValue('test');
            const text = await translateAudio({
                ...props,
                apiKey: 'test-api-key',
            });
            expect(text).toBe('test');
            expect(mockTranslator).toBeCalledWith(
                mockAudioBuffer,
                'test-api-key'
            );
        });

        it('should return null if translator returns empty text', async () => {
            mockTranslator.mockResolvedValue('');
            const text = await translateAudio(props);
            expect(text).toBe(null);
        });

        it('should return null if translator throws error', async () => {
            mockTranslator.mockRejectedValue('test');
            const text = await translateAudio(props);
            expect(text).toBe(null);
        });
    });

    describe('downloadAudio', () => {
        jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);

        it('should download audio', async () => {
            mockAxiosGet.mockResolvedValue({
                data: mockAudioBuffer,
            });

            const audioBuffer = await downloadAudio(
                mockLogger,
                'test-audio-src'
            );
            expect(audioBuffer).toBe(mockAudioBuffer);
        });

        it('should return null if download fails', async () => {
            mockAxiosGet.mockRejectedValue('test');

            const audioBuffer = await downloadAudio(
                mockLogger,
                'test-audio-src'
            );
            expect(audioBuffer).toBe(null);
        });
    });
});
