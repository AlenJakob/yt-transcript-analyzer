import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ModelSelect from '../ModelSelect';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Dispatch, SetStateAction, useState } from 'react';

interface TranscriptGeneratorProps {
	selectedModel: string;
	setSelectedModel: Dispatch<SetStateAction<string>>;
	formattedParagraphs: string[];
}

export default function TranscriptGenerator({
	selectedModel,
	setSelectedModel,
	formattedParagraphs,
}: TranscriptGeneratorProps) {
	const [aiResponse, setAiResponse] = useState('');
	const [isAiLoading, setIsAiLoading] = useState(false);
	const handleGenAi = async () => {
		const transcriptText = formattedParagraphs.join('\n\n');

		try {
			setIsAiLoading(true);
			if (aiResponse?.length) {
				setAiResponse('');
			}
			const resp = await fetch('/api/ai', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: selectedModel,
					transcriptText,
					promptPreset:
						'Przeanalizuj poniższą transkrypcję i stwórz streszczenie. Zbierz najważniejsze informacje, nie pomijaj istotnych szczegółów',
				}),
			});
			const data = await resp.json();
			console.log('AI Response:', data);

			setAiResponse(data?.result);
			setIsAiLoading(false);
		} catch (err) {
			console.error('AI Error:', err);
			setIsAiLoading(false);
		} finally {
			setIsAiLoading(false);
		}
	};

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 2,
				p: { xs: 3, sm: 4 },
				bgcolor: '#121824',
				border: '1px solid rgba(255, 255, 255, 0.08)',
				borderRadius: 1,
			}}
		>
			<Typography
				variant="h3"
				sx={{
					lineHeight: 1.85,
					letterSpacing: '0.015em',
					color: 'text.primary',
					fontSize: '1.1rem',
					mb: '8px',
				}}
			>
				Generowanie podsumowania
			</Typography>
			<Stack>
				<ModelSelect setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
				<Button
					variant="contained"
					size="small"
					startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
					onClick={() => handleGenAi()}
					sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
				>
					GenAI
				</Button>
			</Stack>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography
					variant="body1"
					component="div"
					sx={{
						lineHeight: 1.85,
						letterSpacing: '0.015em',
						color: 'text.primary',
						fontSize: '1.1rem',
					}}
				>
					<>
						<b>Odpowiedź AI:</b> <br /> {aiResponse}
						<span>{isAiLoading ? 'Generuje odpowiedź...' : ''}</span>
					</>
				</Typography>
			</Box>
		</Paper>
	);
}
