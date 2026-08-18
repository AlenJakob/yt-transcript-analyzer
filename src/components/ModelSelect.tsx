'use client';

import { Paper, Box, Select, MenuItem, Typography } from '@mui/material';
import { ModelOpenRouter } from '@/types/openRouter';
import { useEffect, useState, startTransition } from 'react';

const AUTO_MODEL = {
	id: 'openrouter/free',
	name: '⚡ OpenRouter Auto Free (Automatyczny)',
	description: 'Automatycznie wybiera obecnie dostępny darmowy model',
};

const mapModels = (models: ModelOpenRouter[]) =>
	models.map((model) => {
		return {
			name: model.name,
			description: model.description,
			id: model.id,
		};
	});

interface ModelSelectProps {
	setSelectedModel: (model: string) => void;
	selectedModel: string;
}

export default function ModelSelect({ selectedModel, setSelectedModel }: ModelSelectProps) {
	const [models, setModels] = useState<Partial<ModelOpenRouter>[] | undefined>(undefined);

	useEffect(() => {
		const getModels = async () => {
			try {
				const res = await fetch('/api/ai/models');
				const data = await res.json();

				const fetchedModels = data.models?.freeModels ? mapModels(data.models.freeModels) : [];
				const mappedModels = [AUTO_MODEL, ...fetchedModels];

				startTransition(() => {
					setModels(mappedModels);

					if (!selectedModel && mappedModels.length > 0 && mappedModels[0].id) {
						setSelectedModel(mappedModels[0].id);
					}
				});
			} catch (err) {
				console.error('Failed to fetch AI models:', err);
				setModels([AUTO_MODEL]);
			}
		};

		getModels();
	}, [selectedModel, setSelectedModel]);

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3.5 },
				height: '100%',
				bgcolor: 'background.paper',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 2,
				boxShadow: (theme) =>
					theme.palette.mode === 'dark'
						? '0 8px 32px rgba(0, 0, 0, 0.4)'
						: '0 4px 20px rgba(0, 0, 0, 0.05)',
			}}
		>
			<Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
				Model Select
			</Typography>
			<Box sx={{ mb: 2 }}>
				<Select
					id="model-select-dropdown"
					size="medium"
					fullWidth
					value={selectedModel}
					onChange={(e) => setSelectedModel(e.target.value)}
				>
					{models?.map((model) => (
						<MenuItem key={model.id} value={model.id}>
							{model.name}
						</MenuItem>
					))}
				</Select>
			</Box>
		</Paper>
	);
}
