# 📖 Dokumentacja Techniczna — YT Transcript Analyzer

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Material UI v6 (MUI) |
| Język | TypeScript |
| Persistence | `localStorage` (klient) |
| Pobieranie transkrypcji | `youtube-transcript` (npm) |
| Metadane wideo | YouTube oEmbed API (publiczne, bez klucza) |

---

## Architektura — schemat przepływu danych

```
Użytkownik wpisuje URL
        │
        ▼
[UrlInputForm] ──── onFetchTranscript(url) ────► [page.tsx]
                                                      │
                                           POST /api/transcript
                                                      │
                                                      ▼
                                         [route.ts — Server-side]
                                         ┌────────────────────────┐
                                         │ 1. extractVideoId(url) │
                                         │ 2. fetchVideoMetadata()│  ◄── YouTube oEmbed API
                                         │ 3. fetchTranscript()   │  ◄── youtube-transcript
                                         │ 4. decode HTML entities│
                                         │ 5. calculateStats()    │
                                         └────────────────────────┘
                                                      │
                                           JSON { metadata, segments, stats }
                                                      │
                                                      ▼
                                               [page.tsx]
                                         ┌─────────────────────────┐
                                         │ setMetadata / setSegments│
                                         │ saveToHistory() → LS    │  ◄── localStorage
                                         └─────────────────────────┘
                                                      │
                             ┌────────────────────────┼─────────────────────┐
                             ▼                        ▼                     ▼
                  [VideoMetadataCard]      [TranscriptViewer]    [AiAnalysisPresets]
```

---

## Struktura plików

```
src/
├── app/
│   ├── page.tsx                  # Główna strona — root komponent
│   ├── layout.tsx                # Globalny layout z ThemeRegistry
│   └── api/
│       └── transcript/
│           └── route.ts          # API Route — serwer Next.js (POST)
│
├── components/
│   ├── Header.tsx                # Nagłówek z przełącznikiem Analyzer/Archiwum
│   ├── UrlInputForm.tsx          # Pole URL + przycisk pobierania
│   ├── VideoMetadataCard.tsx     # Karta metadanych (tytuł, kanał, miniaturka, statystyki)
│   ├── TranscriptViewer.tsx      # Przeglądarka transkrypcji (Czasówki / Tekst Ciągły)
│   ├── AiAnalysisPresets.tsx     # Szablony promptów AI
│   ├── ArchiveView.tsx           # Widok archiwum (historia z localStorage)
│   └── ThemeRegistry.tsx         # Provider ciemnego motywu MUI
│
└── lib/
    ├── youtube.ts                # Funkcje pomocnicze: parsowanie URL, formatowanie, logika akapitów
    └── storage.ts                # CRUD dla historii w localStorage
```

---

## Opis komponentów i plików

### `src/app/page.tsx` — Orkiestrator

Główny komponent aplikacji. Trzyma cały globalny stan:

| State | Typ | Opis |
|---|---|---|
| `activeTab` | `'analyzer' \| 'archive'` | Aktywny widok |
| `isLoading` | `boolean` | Czy trwa pobieranie |
| `error` | `string \| null` | Komunikat błędu |
| `metadata` | `VideoMetadata \| null` | Dane o filmie |
| `segments` | `TranscriptSegment[]` | Segmenty transkrypcji |
| `stats` | `TranscriptStats \| null` | Statystyki tekstu |
| `history` | `HistoryItem[]` | Historia z localStorage |

Kluczowa funkcja `handleFetchTranscript(url)`:
1. Wysyła `POST /api/transcript` z URL-em
2. Po sukcesie: ustawia state + zapisuje do archiwum
3. Obsługuje błędy (brak napisów, zły URL itp.)

---

### `src/app/api/transcript/route.ts` — API (Server-side)

Next.js Route Handler działający **wyłącznie po stronie serwera**. Obsługa `POST`:

1. **Walidacja** — sprawdza czy `url` nie jest pusty
2. **Ekstrakcja ID** — `extractYouTubeVideoId()` obsługuje formaty: `youtube.com/watch?v=`, `youtu.be/`, `shorts/`, `embed/`, nagie ID
3. **Metadane** — `fetchVideoMetadata()` uderza w `youtube.com/oembed` (bez klucza API, publiczne)
4. **Transkrypcja** — `YoutubeTranscript.fetchTranscript()` z biblioteki `youtube-transcript`. Najpierw próba PL, fallback do domyślnego języka
5. **Normalizacja** — offset/duration mogą być w ms lub s (normalizacja przez `> 10000` check), dekodowanie HTML entities (`&amp;`, `&#39;` itp.)
6. **Statystyki** — liczba słów, znaków, szacowany czas czytania (200 słów/min)
7. Zwraca `{ success, metadata, segments, stats }`

---

### `src/lib/youtube.ts` — Biblioteka pomocnicza

Eksportuje typy i funkcje:

| Funkcja | Opis |
|---|---|
| `extractYouTubeVideoId(url)` | Parsuje URL YouTube i zwraca 11-znakowe ID |
| `formatTimestamp(seconds)` | Konwertuje sekundy → `"mm:ss"` lub `"hh:mm:ss"` |
| `fetchVideoMetadata(videoId)` | Pobiera metadane przez oEmbed API |
| `calculateTranscriptStats(segments)` | Oblicza wordCount, charCount, readingTime |
| `groupTranscriptSegments(segments, duration)` | Scala drobne segmenty w bloki co N sekund |
| `formatContinuousParagraphs(segments)` | Konwertuje segmenty → `string[]` (akapity ~60–90 słów) |

#### `formatContinuousParagraphs` — algorytm

1. Skleja wszystkie teksty segmentów w jeden ciąg
2. Iteruje po słowach
3. Kapitalizuje pierwsze słowo nowego akapitu
4. Kończy akapit gdy: `wordCount >= 60 && ends with [.!?]` LUB `wordCount >= 90`
5. Dodaje kropkę na końcu jeśli brakuje interpunkcji
6. Zwraca `string[]` — każdy element to jeden akapit

---

### `src/lib/storage.ts` — Trwałość danych

Zarządza historią transkrypcji w `localStorage` pod kluczem `yt_transcript_history_v1`.

| Funkcja | Opis |
|---|---|
| `getHistory()` | Odczytuje i parsuje JSON z localStorage |
| `saveToHistory(...)` | Dodaje wpis na początku listy (usuwa duplikaty po videoId), limit 50 wpisów |
| `removeFromHistory(videoId)` | Usuwa jeden wpis |
| `clearHistory()` | Czyści całe archiwum |

> ⚠️ Wszystkie funkcje zaczynają się od `if (typeof window === 'undefined') return []` — zabezpieczenie przed SSR (Next.js renderuje też po stronie serwera gdzie `window` nie istnieje).

---

### `TranscriptViewer.tsx` — Przeglądarka

Dwa tryby widoku przełączane przez `ToggleButtonGroup`:

#### Tryb: Czasówki (`timestamps`)
- Segmenty pogrupowane przez `groupTranscriptSegments()` co 30s / 60s / oryginalne
- Każdy blok to `<Card>` z chipem czasówki + przyciskami: kopiuj fragment, otwórz YT w tym momencie
- Grid responsywny: `xs: 12, md: 6` (lub `md: 4` przy drobnych czankach)

#### Tryb: Tekst Ciągły (`continuous`) — domyślny
- `formatContinuousParagraphs()` zwraca `string[]` akapitów
- Każdy akapit renderowany jako oddzielny `<Typography>` z `lineHeight: 1.85`
- Separator `gap: 2` między akapitami

#### Stan pochodny (useMemo)
```
segments ──► processedSegments (groupInterval)
          └─► filteredSegments (searchQuery)
          └─► formattedParagraphs (paragraphs array)
```

---

### `AiAnalysisPresets.tsx` — Szablony AI

Gotowe szablony promptów do wklejenia w ChatGPT/Claude itp:
- TL;DR
- Notatki ze spotkania
- Fact Check
- Wykrywanie manipulacji/scamu
- Tryb Nauki

Każdy szablon przy kliknięciu "Kopiuj" wkleja automatycznie pełną transkrypcję na koniec promptu.

---

## Przepływ — od kliknięcia do wyświetlenia

```
1. User wpisuje URL → [UrlInputForm] waliduje wstępnie
2. Klik "Pobierz" → handleFetchTranscript(url) w page.tsx
3. fetch('POST /api/transcript') → route.ts na serwerze
4. route.ts:
   a. extractYouTubeVideoId(url)
   b. fetchVideoMetadata(videoId)  ← HTTP do youtube.com/oembed
   c. YoutubeTranscript.fetchTranscript(videoId) ← HTTP do YouTube
   d. Normalizacja offsetów, decode HTML
   e. calculateTranscriptStats()
   f. return JSON
5. page.tsx odbiera { metadata, segments, stats }
6. saveToHistory() → zapisuje do localStorage
7. React re-render:
   - VideoMetadataCard wyświetla tytuł/kanał/miniaturkę/statystyki
   - TranscriptViewer wyświetla akapity (domyślnie tryb Tekst Ciągły)
   - AiAnalysisPresets pokazuje szablony promptów
```

---

## Ważne decyzje projektowe

| Decyzja | Powód |
|---|---|
| API Route zamiast fetch bezpośrednio z klienta | `youtube-transcript` działa tylko w Node.js (nie w przeglądarce) |
| localStorage zamiast bazy danych | Prostota MVP, brak potrzeby backendu do przechowywania |
| `string[]` z `formatContinuousParagraphs` zamiast jednego stringa | Umożliwia renderowanie każdego akapitu jako osobny `<Typography>` z pełną kontrolą stylowania |
| oEmbed API bez klucza | YouTube udostępnia oEmbed publicznie — zero konfiguracji |
| Fallback języka transkrypcji (PL → any) | Większość filmów ma napisy auto-generowane w języku oryginalnym |
