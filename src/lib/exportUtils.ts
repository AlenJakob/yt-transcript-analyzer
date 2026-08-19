/**
 * Utility functions for exporting AI summaries into TXT, Markdown, and PDF formats.
 */

export function exportToTxt(content: string, filename: string = 'ai-summary.txt'): void {
	const element = document.createElement('a');
	const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
	element.href = URL.createObjectURL(file);
	element.download = filename;
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

export function exportToMarkdown(
	content: string,
	filename: string = 'ai-summary.md',
	metadata?: { model?: string; language?: string }
): void {
	const header = `# TubeDigest AI Summary\n\n- **Model AI:** ${metadata?.model || 'OpenRouter'}\n- **Język:** ${metadata?.language?.toUpperCase() || 'PL'}\n- **Data:** ${new Date().toLocaleDateString('pl-PL')}\n\n---\n\n`;
	const fullContent = header + content + '\n';
	const element = document.createElement('a');
	const file = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
	element.href = URL.createObjectURL(file);
	element.download = filename;
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

export function exportToPdf(
	content: string,
	metadata?: { model?: string; language?: string }
): void {
	const printWindow = window.open('', '_blank');
	if (!printWindow) {
		alert('Zablokowano wyskakujące okno. Zezwól na wyskakujące okna, aby pobrać PDF.');
		return;
	}

	const dateStr = new Date().toLocaleDateString('pl-PL');
	const modelStr = metadata?.model || 'OpenRouter';
	const langStr = metadata?.language?.toUpperCase() || 'PL';

	printWindow.document.write(`
		<!DOCTYPE html>
		<html lang="pl">
		<head>
			<meta charset="utf-8" />
			<title>TubeDigest - Podsumowanie AI</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
					padding: 40px;
					color: #1e293b;
					line-height: 1.7;
					max-width: 800px;
					margin: 0 auto;
				}
				h1 {
					color: #0f172a;
					font-size: 22px;
					border-bottom: 2px solid #e2e8f0;
					padding-bottom: 12px;
					margin-bottom: 8px;
				}
				.meta {
					font-size: 13px;
					color: #64748b;
					margin-bottom: 24px;
				}
				.content {
					white-space: pre-line;
					font-size: 15px;
					background: #f8fafc;
					padding: 24px;
					border-radius: 8px;
					border: 1px solid #e2e8f0;
				}
			</style>
		</head>
		<body>
			<h1>TubeDigest – Podsumowanie AI</h1>
			<div class="meta">
				<strong>Model:</strong> ${modelStr} &nbsp;|&nbsp; 
				<strong>Język:</strong> ${langStr} &nbsp;|&nbsp; 
				<strong>Data:</strong> ${dateStr}
			</div>
			<div class="content">${content}</div>
			<script>
				window.onload = function() {
					window.print();
				};
			</script>
		</body>
		</html>
	`);
	printWindow.document.close();
}

export async function exportToAudioMp3(
	content: string,
	filename: string = 'podsumowanie-ai.mp3',
	language: string = 'pl'
): Promise<void> {
	const response = await fetch('/api/ai/tts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ text: content, language }),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || 'Nie udało się pobrać pliku audio MP3');
	}

	const blob = await response.blob();
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
