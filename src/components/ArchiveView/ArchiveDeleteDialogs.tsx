'use client';

import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from '@mui/material';

interface ArchiveDeleteDialogsProps {
	confirmClearOpen: boolean;
	onCloseConfirmClear: () => void;
	onClearHistory: () => void;
	historyLength: number;
	itemToDelete: string | null;
	onCloseItemToDelete: () => void;
	onDeleteItem: (id: string) => void;
}

export default function ArchiveDeleteDialogs({
	confirmClearOpen,
	onCloseConfirmClear,
	onClearHistory,
	historyLength,
	itemToDelete,
	onCloseItemToDelete,
	onDeleteItem,
}: ArchiveDeleteDialogsProps) {
	return (
		<>
			{/* Dialog potwierdzenia wyczyszczenia całej historii */}
			<Dialog
				open={confirmClearOpen}
				onClose={onCloseConfirmClear}
				slotProps={{
					paper: {
						sx: {
							bgcolor: '#121824',
							backgroundImage: 'none',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							borderRadius: 2,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Wyczyścić całą historię?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: 'text.secondary' }}>
						Czy na pewno chcesz usunąć wszystkie zapisane transkrypcje ({historyLength} wideo) z
						pamięci lokalnej? Ta akcja jest nieodwracalna.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}>
					<Button onClick={onCloseConfirmClear} variant="outlined" color="inherit">
						Anuluj
					</Button>
					<Button
						onClick={() => {
							onClearHistory();
							onCloseConfirmClear();
						}}
						variant="contained"
						color="error"
					>
						Wyczyść wszystko
					</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog potwierdzenia usunięcia pojedynczego elementu */}
			<Dialog
				open={Boolean(itemToDelete)}
				onClose={onCloseItemToDelete}
				slotProps={{
					paper: {
						sx: {
							bgcolor: '#121824',
							backgroundImage: 'none',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							borderRadius: 2,
						},
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Usuń z historii</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: 'text.secondary' }}>
						Czy na pewno chcesz usunąć tę transkrypcję z historii lokalnej?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}>
					<Button onClick={onCloseItemToDelete} variant="outlined" color="inherit">
						Anuluj
					</Button>
					<Button
						onClick={() => {
							if (itemToDelete) {
								onDeleteItem(itemToDelete);
							}
							onCloseItemToDelete();
						}}
						variant="contained"
						color="error"
					>
						Usuń
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
