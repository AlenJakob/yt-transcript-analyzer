import { describe, it, expect } from 'vitest';
import {
	extractYouTubeVideoId,
	formatTimestamp,
	calculateTranscriptStats,
	groupTranscriptSegments,
	formatContinuousParagraphs,
	TranscriptSegment,
} from './youtube';

describe('YouTube Utilities', () => {
	describe('extractYouTubeVideoId', () => {
		it('should extract video ID from standard YouTube URL', () => {
			const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
			expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
		});

		it('should extract video ID from short YouTube URL', () => {
			const url = 'https://youtu.be/dQw4w9WgXcQ';
			expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
		});

		it('should extract video ID from embed URL', () => {
			const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
			expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
		});

		it('should extract video ID from shorts URL', () => {
			const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
			expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
		});

		it('should return raw ID if an 11-character ID is provided', () => {
			expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
		});

		it('should return null for invalid or non-YouTube URLs', () => {
			expect(extractYouTubeVideoId('https://example.com')).toBeNull();
			expect(extractYouTubeVideoId('')).toBeNull();
		});
	});

	describe('formatTimestamp', () => {
		it('should format seconds into mm:ss when under one hour', () => {
			expect(formatTimestamp(45)).toBe('00:45');
			expect(formatTimestamp(125)).toBe('02:05');
		});

		it('should format seconds into h:mm:ss when one hour or longer', () => {
			expect(formatTimestamp(3665)).toBe('1:01:05');
		});
	});

	describe('calculateTranscriptStats', () => {
		it('should calculate word count, character count, and reading time correctly', () => {
			const segments: TranscriptSegment[] = [
				{ text: 'Hello world', offset: 0, duration: 2, timestamp: '00:00' },
				{ text: 'This is a test transcript.', offset: 2, duration: 3, timestamp: '00:02' },
			];

			const stats = calculateTranscriptStats(segments);

			expect(stats.wordCount).toBe(7);
			expect(stats.charCount).toBe(38);
			expect(stats.readingTimeMinutes).toBe(1);
		});
	});

	describe('groupTranscriptSegments', () => {
		it('should group fine-grained segments into larger duration buckets', () => {
			const segments: TranscriptSegment[] = [
				{ text: 'First line.', offset: 0, duration: 15, timestamp: '00:00' },
				{ text: 'Second line.', offset: 15, duration: 20, timestamp: '00:15' },
			];

			const grouped = groupTranscriptSegments(segments, 30);

			expect(grouped.length).toBe(1);
			expect(grouped[0].text).toBe('First line. Second line.');
			expect(grouped[0].duration).toBe(35);
			expect(grouped[0].offset).toBe(0);
		});

		it('should return an empty array if segments array is empty', () => {
			expect(groupTranscriptSegments([])).toEqual([]);
		});
	});

	describe('formatContinuousParagraphs', () => {
		it('should format segments into clean continuous paragraphs', () => {
			const segments: TranscriptSegment[] = [
				{ text: 'hello world', offset: 0, duration: 2, timestamp: '00:00' },
				{ text: 'this is transcript formatting', offset: 2, duration: 3, timestamp: '00:02' },
			];

			const paragraphs = formatContinuousParagraphs(segments);

			expect(paragraphs.length).toBeGreaterThan(0);
			expect(paragraphs[0]).toBe('Hello world this is transcript formatting.');
		});

		it('should return an empty array for empty inputs', () => {
			expect(formatContinuousParagraphs([])).toEqual([]);
		});
	});
});
