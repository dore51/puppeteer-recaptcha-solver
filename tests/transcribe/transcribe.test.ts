import { Logger } from '../../src';
import {
    transcribeAudio,
    downloadAudio,
} from '../../src/transcribe/transcribe';
import axios from 'axios';

const mockAudioBuffer = Buffer.from('test');
const mockLogger: Logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
const mockTranscriber = jest.fn();
const mockAxiosGet = jest.fn();

describe('transcribe service', () => {
    describe('transcribeAudio', () => {
        const props = {
            audioBuffer: mockAudioBuffer,
            logger: mockLogger,
            transcriber: mockTranscriber,
        };

        it('should transcribe audio to text without API key', async () => {
            mockTranscriber.mockResolvedValue('test');
            const text = await transcribeAudio(props);
            expect(text).toBe('test');
            expect(mockTranscriber).toBeCalledWith(mockAudioBuffer, undefined);
        });

        it('should transcribe audio to text with API key', async () => {
            mockTranscriber.mockResolvedValue('test');
            const text = await transcribeAudio({
                ...props,
                apiKey: 'test-api-key',
            });
            expect(text).toBe('test');
            expect(mockTranscriber).toBeCalledWith(
                mockAudioBuffer,
                'test-api-key'
            );
        });

        it('should return null if transcriber returns empty text', async () => {
            mockTranscriber.mockResolvedValue('');
            const text = await transcribeAudio(props);
            expect(text).toBe(null);
        });

        it('should return null if transcriber throws error', async () => {
            mockTranscriber.mockRejectedValue('test');
            const text = await transcribeAudio(props);
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
