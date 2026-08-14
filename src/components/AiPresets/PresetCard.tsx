'use client';

import { Card, CardContent, Stack, Typography, Button, Grid } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PromptPreset } from './presetsData';

interface PresetCardProps {
	preset: PromptPreset;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onCopyPrompt: (preset: PromptPreset) => void;
}

export default function PresetCard({
	preset,
	isSelected,
	onSelect,
	onCopyPrompt,
}: PresetCardProps) {
	return (
		<Grid size={{ xs: 12, sm: 6, md: 4 }}>
			<Card
				onClick={() => onSelect(preset.id)}
				sx={{
					height: '100%',
					cursor: 'pointer',
					borderColor: isSelected ? preset.color : 'rgba(255, 255, 255, 0.08)',
					borderWidth: isSelected ? '2px' : '1px',
					bgcolor: isSelected ? 'rgba(255, 255, 255, 0.03)' : '#121824',
					transition: 'all 0.2s ease',
					'&:hover': {
						borderColor: preset.color,
						transform: 'translateY(-2px)',
					},
				}}
			>
				<CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
					<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
						{preset.icon}
						<Typography
							variant="subtitle1"
							sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}
						>
							{preset.title}
						</Typography>
					</Stack>
					<Typography
						variant="body2"
						sx={{ color: 'text.secondary', fontSize: '0.85rem', flexGrow: 1, mb: 2 }}
					>
						{preset.description}
					</Typography>
					<Button
						variant={isSelected ? 'contained' : 'outlined'}
						size="small"
						startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
						onClick={(e) => {
							e.stopPropagation();
							onCopyPrompt(preset);
						}}
						sx={{
							bgcolor: isSelected ? preset.color : 'transparent',
							borderColor: preset.color,
							color: isSelected ? '#ffffff' : preset.color,
							'&:hover': {
								bgcolor: preset.color,
								color: '#ffffff',
							},
						}}
					>
						Kopiuj Prompt
					</Button>
				</CardContent>
			</Card>
		</Grid>
	);
}
