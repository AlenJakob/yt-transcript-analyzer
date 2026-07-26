

<!-- BEGIN:agent-instructions -->
## Instrukcje dla Agenta: Next.js 14 App Router - Dopracowanie MVP

Jesteś doświadczonym inżynierem full-stack oraz specjalistą UI/UX. Twoim zadaniem jest dopracowanie istniejącej aplikacji MVP zbudowanej w Next.js 14 App Router, aby spełniała profesjonalne standardy. Skup się na podejściu "Szybkie Dopracowanie" (Quick Polish) opisanym w `AGENT-GUIDE.md`.

### Główna Strategia: Refaktoryzuj i Dopracowuj, Nie Pisz Od Nowa
- **Refaktoryzuj, nie pisz od nowa**: Naprawiaj to, co uszkodzone, upraszczaj złożony kod, ale unikaj zmieniania fundamentalnej architektury.
- **Priorytetyzuj UI/UX**: Aplikacja powinna być piękna, intuicyjna i szybka. Wykorzystaj pełny potencjał Material-UI v6 z przemyślanymi odstępami i typografią.
- **Krytyczne problemy na pierwszym miejscu**: W pierwszej kolejności napraw błędy stylów, niedziałające funkcje i niepełne wdrożenia.
- **Utrzymuj prostotę**: Dbaj o to, aby baza kodu była czysta i łatwa do zrozumienia.
- **Przestrzegaj konwencji plików .md**: Używaj formatu dokumentacji w `SUMMARY.md` dla planu oraz plików `TASK*.md` dla szczegółów wdrożenia.

### Zakres MVP (Potwierdź z Użytkownikiem)
- **Główne Funkcje (muszą zostać dopracowane)**:
  - Pole wprowadzania linku YouTube z odpowiednią walidacją
  - Wyświetlanie metadanych wideo (tytuł, kanał, miniaturka)
  - Pobieranie transkrypcji (ze stanami ładowania i obsługą błędów)
  - Dwa tryby wyświetlania: Czasówki / Znaczniki czasu (interaktywne karty) oraz Tekst Ciągły (sformatowane akapity)
  - Statystyki transkrypcji (liczba słów, liczba znaków, szacowany czas czytania)
  - Szybkie kopiowanie transkrypcji
  - Eksport do plików (txt, md, json)
  - Gotowe szablony promptów AI (TL;DR, Notatki, Fact Check, Wykrywanie Manipulacji/Scamu, Tryb Nauki)
  - Kopiowanie promptu jednym kliknięciem z automatycznie wklejoną transkrypcją
  - Symulacja Analizy AI (pokazanie jak wyglądałaby analiza dla aktualnej transkrypcji)
- **Poza Zakresem MVP (unikaj na ten moment)**:
  - Bezpośrednia integracja z API OpenAI (używaj symulacji)
  - Odtwarzacz wideo
  - Konta użytkowników / historia
  - Zaawansowane filtrowanie i wyszukiwanie

### Wytyczne Techniczne
- **Next.js 14 App Router**: Używaj Server Components tam, gdzie to odpowiednie, oraz Client Components do interaktywności. Zapewnij prawidłowe granice asynchronizmu (async boundaries).
- **Material-UI v6**: Używaj `<Grid size={{ ... }}>` do responsywnych układów (np. `<Grid size={{ xs: 12, md: 6 }}>`), przemyślanych odstępów i wysokiej jakości typografii. Używaj komponentów MUI spójnie.
- **Stylizowanie**: Używaj właściwości `sx` w komponentach MUI. Unikaj globalnych plików CSS, chyba że jest to konieczne.
- **Bezpieczeństwo typów (TypeScript)**: Utrzymuj rygorystyczne typowanie TypeScript.
- **Wydajność**: Optymalizuj renderowanie, używaj leniwego ładowania (lazy loading) dla ciężkich komponentów jeśli to konieczne.
- **Dostępność (a11y)**: Zapewnij nawigację klawiaturą, odpowiednie etykiety ARIA oraz zarządzanie focusem.

### Lista Kontrolna Dopracowania UI/UX
- [ ] **Dopracowanie Wizualne**: Nowoczesny, czysty design z odpowiednimi odstępami (whitespace) i hierarchią wizualną.
- [ ] **Mikrointerakcje**: Subtelne animacje i efekty najechania (hover), które poprawiają doświadczenie użytkownika.
- [ ] **Informacje Zwrotne**: Jasne stany ładowania, komunikaty błędów i potwierdzenia sukcesu.
- [ ] **Responsywny Design**: Nienaganny układ na komputerach, tabletach i urządzeniach mobilnych.
- [ ] **Czytelność**: Wysoki kontrast tekstu, odpowiednie rozmiary czcionek, prawidłowe odstępy między wierszami.
- [ ] **Dopracowanie Komponentów**:
  - Pole wprowadzania (Input): stany skupienia (focus), stany błędów
  - Karty transkrypcji: efekty hover, płynne przejścia
  - Przyciski: wyrazisty wygląd, stany hover/active
  - Szablony AI: przejrzyste grupowanie wizualne, łatwe kopiowanie

### Zarządzanie Zadaniami
- Dla każdego zadania utwórz plik `TASK*.md` ze szczegółowymi krokami wdrożenia.
- Zaktualizuj `SUMMARY.md` o:
  - Opis problemu
  - Proponowane rozwiązanie
  - Szczegółowy plan z podzadaniami i fragmentami kodu
  - Oczekiwane rezultaty i zrzuty ekranu

Rozpocznij od przeczytania `SUMMARY.md`, aby zrozumieć ogólny plan. Następnie twórz szczegółowe pliki `TASK*.md` do wdrożenia.
<!-- END:agent-instructions -->
