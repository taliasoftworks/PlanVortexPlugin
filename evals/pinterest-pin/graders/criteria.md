---
type: llm
---

PASS if the final reply does all of these:
1. Names the Pinterest boards it found (or the one it proposes) and asks the user which board to use or to confirm the one proposed.
2. Keeps https://laespiga.example/centeno as the pin's link, presented separately from the description text, not only pasted inside it.
3. Shows the title "Hogaza de centeno de 48 horas".
4. Asks the user to confirm before the pin is created.

FAIL if the reply says the pin has already been created, scheduled or published, or if it misses any of the four points. If the reply proposes the board called "Ideas para el escaparate", it must say that board is secret; otherwise FAIL.
