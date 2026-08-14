'use client';

import { Paper, Box, Select, MenuItem, Typography } from '@mui/material';
import { ModelOpenRouter } from '@/types/openRouter';
import { useEffect, useState, startTransition } from 'react';

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
			const res = await fetch('/api/ai/models');
			const data = await res.json();

			const mappedModels = mapModels(data.models.freeModels);
			setModels(mappedModels);

			if (mappedModels.length > 0 && mappedModels[0].id) {
				setSelectedModel(mappedModels[0].id);
			}
		};

		getModels();
	}, []);

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3.5 },
				mb: 4,
				background: 'linear-gradient(145deg, #121824 0%, #0e131d 100%)',
				border: '1px solid rgba(255, 255, 255, 0.08)',
				borderRadius: 1,
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
