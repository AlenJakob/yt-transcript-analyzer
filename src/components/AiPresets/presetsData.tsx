import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GppBadIcon from '@mui/icons-material/GppBad';
import SchoolIcon from '@mui/icons-material/School';

export interface PromptPreset {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	buildPrompt: (transcriptText: string, title: string) => string;
	simulatedOutput: (transcriptText: string, title: string) => string;
}

export const PRESETS: PromptPreset[] = [
	{
		id: 'tldr',
		title: 'TL;DR - Szybkie Podsumowanie',
		description:
			'Generuje zwięzłe podsumowanie w 3-5 kluczowych zdaniach z najważniejszym wnioskiem.',
		icon: <AutoAwesomeIcon sx={{ color: '#3b82f6' }} />,
		color: '#3b82f6',
		buildPrompt: (text, title) =>
			`Przeanalizuj poniższą transkrypcję filmu "${title}". Przygotuj zwięzłe podsumowanie w stylu TL;DR:\n` +
			`1. Główne przesłanie filmu (1 zdanie)\n` +
			`2. 3 najważniejsze wnioski w punktach\n` +
			`3. Dla kogo ten materiał jest najbardziej wartościowy\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`📌 **TL;DR dla filmu: "${title}"**\n\n` +
			`• **Główne przesłanie:** Materiał przedstawia kluczowe strategie oraz praktyczne wskazówki dotyczące efektywnej pracy z nowoczesnymi technologiami i narzędziami AI.\n\n` +
			`• **Kluczowe wnioski:**\n` +
			`  1. Automatyzacja powtarzalnych procesów pozwala zaoszczędzić do 40% czasu dziennie.\n` +
			`  2. Zrozumienie fundamentów jest ważniejsze niż testowanie dziesiątek powierzchownych narzędzi.\n` +
			`  3. Systematyczna weryfikacja i podsumowywanie wiedzy znacząco zwiększa retencję informacji.\n\n` +
			`💡 **Dla kogo:** Praktycy, twórcy i inżynierowie szukający konkretnych, sprawdzonych rozwiązań bez zbędnego lania wody.`,
	},
	{
		id: 'notes',
		title: 'Strukturyzowane Notatki',
		description: 'Tworzy przejrzyste notatki podzielone na sekcje, zagadnienia i definicje.',
		icon: <FormatListNumberedIcon sx={{ color: '#10b981' }} />,
		color: '#10b981',
		buildPrompt: (text, title) =>
			`Stwórz ustrukturyzowane notatki z transkrypcji filmu "${title}":\n` +
			`- Podziel treść na logiczne sekcje z nagłówkami\n` +
			`- Wyciągnij wypunktowane definicje i pojęcia\n` +
			`- Zapisz zalecane kroki akcji (Actionable Items)\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`📝 **Strukturyzowane Notatki: "${title}"**\n\n` +
			`### 1. Wprowadzenie i Kontekst\n` +
			`- Autor omawia kluczowe wyzwania występujące w przetwarzaniu dużych wolumenów danych i informacji.\n` +
			`- Zwrócono uwagę na potrzebę strukturacji nieustrukturyzowanego tekstu.\n\n` +
			`### 2. Główne Pojęcia i Definicje\n` +
			`- **Prompt Engineering:** Sztuka precyzyjnego formułowania zapytań dla modeli językowych.\n` +
			`- **Context Window:** Maksymalny rozmiar tekstu, jaki model może przeanalizować w jednym zapytaniu.\n\n` +
			`### 3. Lista Działań (Action Items)\n` +
			`- [ ] Przetestować szablony promptów na własnych danych.\n` +
			`- [ ] Zaimplementować automatyczny export notatek do formatu Markdown.`,
	},
	{
		id: 'factcheck',
		title: 'Fact Check & Weryfikacja',
		description: 'Wyciąga z tekstu twierdzenia, dane liczbowe i hipotezy do weryfikacji.',
		icon: <AssignmentTurnedInIcon sx={{ color: '#06b6d4' }} />,
		color: '#06b6d4',
		buildPrompt: (text, title) =>
			`Przeanalizuj transkrypcję filmu "${title}" pod kątem faktów i statystyk:\n` +
			`1. Wyciągnij wszystkie podane statystyki, liczby i daty\n` +
			`2. Wskaż subiektywne opinie autora w przeciwieństwie do obiektywnych faktów\n` +
			`3. Wskarz twierdzenia wymagające dodatkowej weryfikacji ze źródeł zewnętrznych\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🔍 **Weryfikacja Faktów (Fact Check) dla "${title}"**\n\n` +
			`✔️ **Przedstawione Fakty i Dane:**\n` +
			`- Wypowiedzi odnoszą się do udokumentowanych statystyk branżowych.\n` +
			`- Zastosowane wskaźniki procentowe są spójne z oficjalnymi raportami.\n\n` +
			`❓ **Opinie i Hipotezy (Wymagają Uwagi):**\n` +
			`- Twierdzenie o "10x szybszym rozwoju" ma charakter hiperboli retorycznej i zaleca się ostrożność.\n` +
			`- Zapisane prognozy na przyszły rok stanowią estymację autora, a nie potwierdzony fakt.`,
	},
	{
		id: 'scam',
		title: 'Wykrywanie Manipulacji & Scamu',
		description:
			'Analizuje język pod kątem technik erystycznych, FOMO, obietnic bez pokrycia i manipulacji.',
		icon: <GppBadIcon sx={{ color: '#ef4444' }} />,
		color: '#ef4444',
		buildPrompt: (text, title) =>
			`Przeanalizuj transkrypcję "${title}" pod kątem rzetelności oraz wykrywania manipulacji i chwytów marketingowych:\n` +
			`- Czy autor używa językowych wyzwalaczy emocjonalnych (FOMO, pilność)?\n` +
			`- Czy składane są nierrealne obietnice (np. szybki zysk, natychmiastowe rezultaty)?\n` +
			`- Oceń ogólny poziom wiarygodności w skali 1-10 z uzasadnieniem.\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🛡️ **Ocena Wiarygodności & Manipulacji: "${title}"**\n\n` +
			`📊 **Ogólna Wiarygodność:** **8.5 / 10** (Wysoka rzetelność)\n\n` +
			`🟢 **Pozytywne wskaźniki:**\n` +
			`- Brak agresywnych wezwań do natychmiastowego zakupu płatnych kursów.\n` +
			`- Autor otwarcie mówi o ograniczeniach i potencjalnych ryzykach.\n\n` +
			`🟡 **Zauważone techniki perswazji:**\n` +
			`- Subtelne budowanie autorytetu poprzez powoływanie się na własne wieloletnie doświadczenie.\n` +
			`- Użycie chwytliwych nagłówków sekcji dla zwiększenia retencji uwagi.`,
	},
	{
		id: 'learning',
		title: 'Tryb Nauki & Quiz Q&A',
		description: 'Tworzy 5 pytań testowych z odpowiedziami oraz zestaw fiszek do nauki.',
		icon: <SchoolIcon sx={{ color: '#f59e0b' }} />,
		color: '#f59e0b',
		buildPrompt: (text, title) =>
			`Na podstawie transkrypcji "${title}" stwórz materiał edukacyjny:\n` +
			`1. 5 pytań sprawdzających wiedzę (Quiz Q&A) wraz z pełnymi odpowiedziami\n` +
			`2. 3 fiszki (Pojęcie -> Wyjaśnienie)\n\n` +
			`TRANSKRYPCJA:\n${text}`,
		simulatedOutput: (_, title) =>
			`🎓 **Tryb Nauki & Quiz dla "${title}"**\n\n` +
			`❓ **Pytanie 1:** Jaki jest główny cel opisywanej metody?\n` +
			`➔ **Odpowiedź:** Cel stanowi przyspieszenie analizy i wyciąganie najważniejszych wniosków bez konieczności spędzania godzin na oglądaniu całego wideo.\n\n` +
			`❓ **Pytanie 2:** Jakie narzędzie pozwala na szybkie kopiowanie gotowych szablonów?\n` +
			`➔ **Odpowiedź:** Dedykowany moduł AI Prompt Presets zawarty w aplikacji YT Transcript Analyzer.\n\n` +
			`🏷️ **Fiszki do powtórzenia:**\n` +
			`• **Fiszka 1:** Transkrypcja ➔ Tekstowe odwzorowanie ścieżki dźwiękowej filmu.\n` +
			`• **Fiszka 2:** Prompt ➔ Instrukcja przekazywana modelowi sztucznej inteligencji.`,
	},
];
