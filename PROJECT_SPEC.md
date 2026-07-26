# YouTube Transcript Analyzer (MVP) - Specyfikacja i Założenia Projektu

Aplikacja webowa umożliwiająca pobieranie transkrypcji z filmów YouTube poprzez podanie linku do filmu, jej podgląd, wyszukiwanie, kopiowanie oraz przygotowanie pod zaawansowaną analizę AI.

---

## 1. Problem i Cel Projektu

Podczas przeglądania materiałów na YouTube często pojawia się potrzeba:
- Szybkiego zrozumienia treści filmu bez konieczności oglądania całego wideo.
- Sprawdzenia kluczowych informacji i wypowiedzi.
- Przygotowania rzetelnych notatek i podsumowań.
- Dalszej analizy argumentów, fact-checkingu lub weryfikacji wiarygodności materiału.

Aplikacja ma na celu automatyzację pobierania tekstu i ułatwienie jego dalszej obróbki (np. w modelach AI typu ChatGPT, Claude, Gemini).

---

## 2. Zakres MVP (Aktualna Wersja)

### Pobieranie i prezentacja transkrypcji
1. **Wklejanie linku YouTube**: obsługa standardowych linków `youtube.com/watch?v=`, skróconych `youtu.be/`, `youtube.com/shorts/` oraz `embed/`.
2. **Wyciąganie Video ID & Metadanych**: pobieranie miniaturek, tytułu wideo oraz autora kanału.
3. **Pobieranie transkrypcji**: wyciąganie napisów dodanych ręcznie oraz automatycznie wygenerowanych przez YouTube.
4. **Prezentacja tekstu**:
   - **Widok Czasówek (Timestamps)**: kafelki ze znacznikami czasu odsyłające dokładnie do momentu w filmie.
   - **Widok Tekstu Ciągłego (Full Text)**: sformatowany akapitowy tekst do szybkiego czytania.
5. **Narzędzia tekstu**:
   - Wyszukiwarka fraz na żywo w transkrypcji.
   - Statystyki tekstu (ilość słów, znaków, szacowany czas czytania).
   - Kopiowanie tekstu (z lub bez czasówek).
   - Eksport danych do plików `.txt`, `.md`, `.json`.
6. **Sekcja AI Analysis & Prompt Presets**:
   - Gotowe szablony promptów do wklejenia w AI:
     - `[ TL;DR ]` – szybkie podsumowanie
     - `[ Notatki ]` – strukturyzowane notatki i punkty
     - `[ Fact Check ]` – weryfikacja faktów i twierdzeń
     - `[ Scam & Manipulation Detection ]` – analiza wiarygodności
     - `[ Learning Mode ]` – kluczowe definicje i Q&A
   - Jednoklikowe kopiowanie kompletnego promptu z wklejoną transkrypcją.
   - Wbudowana symulacja/podgląd analizy AI wewnątrz aplikacji.

---

## 3. Architektura Systemu

```
User Input (YouTube URL)
       │
       ▼
Next.js Frontend (MUI v6)
       │
       ▼
Extract Video ID & Fetch Metadata
       │
       ▼
Next.js API Route (/api/transcript)
       │
       ▼
YouTube Transcript Service
       │
       ▼
Display Interactive Transcript & AI Presets
```

---

## 4. Stack Technologiczny

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Material-UI (MUI v6 z `<Grid size={{ ... }}>`), Emotion, Lucide Icons.
- **Backend / API**: Next.js API Routes / Server Actions, Node.js.
- **Napisy / Transkrypcja**: `youtube-transcript` / Custom parser + YouTube oEmbed API.

---

## 5. Przyszły Rozwój (Roadmap)

- **Bezpośrednia Integracja z API AI**: Możliwość podania klucza OpenAI/Anthropic/Gemini i generowania analiz bezpośrednio w aplikacji.
- **Wsparcie dla filmów bez napisów**: Pobieranie audio i automatyczna transkrypcja za pomocą modelu Speech-To-Text (np. OpenAI Whisper).
- **Archiwum i historia**: Zapisywanie przetworzonych filmów i wyszukiwanie w historii użytkownika.
