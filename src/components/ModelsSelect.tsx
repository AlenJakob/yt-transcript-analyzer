'use client';

import * as React from 'react';
import { Paper, Box, Select, MenuItem } from '@mui/material';
import { ModelOpenRouter } from '@/types/openRouter';

const mapModels = (models: ModelOpenRouter[]) => {
	const mappedModels = models.map((model) => {
		return {
			name: model.name,
			description: model.description,
			id: model.id,
		};
	});

	return mappedModels;
};

export default function ModelSelect() {
	const [models, setModels] = React.useState<Partial<ModelOpenRouter>[] | undefined>(undefined);
	const [selectedModel, setSelectedModel] = React.useState<string>('');

	React.useEffect(() => {
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
				borderRadius: 4,
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
			}}
		>
			<Box sx={{ mb: 2 }}>
				<Select
					size="medium"
					label="Model"
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
