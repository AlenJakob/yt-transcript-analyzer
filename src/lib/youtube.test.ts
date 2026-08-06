import { describe, it, expect } from 'vitest';
import { extractYouTubeVideoId, formatTimestamp, calculateTranscriptStats } from './youtube';

describe('YouTube Utilities', () => {
	it('should extract video ID from YouTube URLs', () => {
		expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
		expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
		expect(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
		expect(extractYouTubeVideoId('invalid-url')).toBeNull();
	});

	it('should format seconds into timestamps', () => {
		expect(formatTimestamp(45)).toBe('00:45');
		expect(formatTimestamp(125)).toBe('02:05');
		expect(formatTimestamp(3665)).toBe('1:01:05');
	});

	it('should calculate transcript stats correctly', () => {
		const segments = [{ text: 'Hello world test', offset: 0, duration: 2, timestamp: '00:00' }];
		const stats = calculateTranscriptStats(segments);

		expect(stats.wordCount).toBe(3);
		expect(stats.charCount).toBe(16);
		expect(stats.readingTimeMinutes).toBe(1);
	});
});
