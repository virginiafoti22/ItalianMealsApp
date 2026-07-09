# Italian Meals App

**Autore:** Virginia Foti

## Descrizione progetto

Italian Meals App è un’app mobile sviluppata in React Native con Expo che permette di visualizzare una lista di piatti italiani recuperati da TheMealDB, consultare il dettaglio di una ricetta e gestire una lista di preferiti. L’app usa API REST in formato JSON per ottenere sia l’elenco dei piatti sia i dettagli completi di ogni ricetta.

## Funzionalità implementate

- Visualizzazione della lista dei piatti italiani.
- Recupero dati da API esterna TheMealDB.
- Apertura del dettaglio di una ricetta selezionata.
- Visualizzazione di:
  - immagine del piatto,
  - nome,
  - categoria,
  - area di provenienza,
  - ingredienti e misure,
  - istruzioni di preparazione.
- Gestione dei preferiti.
- Gestione del tema light/dark.
- Gestione degli stati di caricamento ed errore.
- Organizzazione del progetto in `services/`, `context/` e `screens/`.

## Tecnologie usate

- React Native
- Expo
- TypeScript
- React Context
- TheMealDB API

## Struttura del progetto

```text
src/
  context/
    FavoritesContext.tsx
    ThemeContext.tsx
  screens/
    HomeScreen.tsx
    DetailsScreen.tsx
  services/
    mealsApi.ts
```

## Prerequisiti

Prima di avviare il progetto è necessario avere installato:

- Node.js LTS
- npm
- Expo Go su smartphone oppure un emulatore Android
- Connessione internet attiva per le chiamate API a TheMealDB.[web:295]

## Installazione e avvio

Clonare il repository:

```bash
git clone <url-repo>
cd <nome-cartella>
npm install
npx expo start
```

Dopo l’avvio di Expo:

- premere `a` per aprire l’app su emulatore Android;
- oppure scansionare il QR code con Expo Go da smartphone.

## API usate

L’app utilizza TheMealDB, una API gratuita che restituisce dati JSON relativi a ricette e pasti.[web:295]

### Endpoint principali

**Lista dei piatti italiani**
```text
https://www.themealdb.com/api/json/v1/1/filter.php?a=Italian
```
Questo endpoint restituisce l’elenco dei pasti filtrati per area italiana.[web:295]

**Dettaglio ricetta per ID**
```text
https://www.themealdb.com/api/json/v1/1/lookup.php?i=<idMeal>
```
Questo endpoint restituisce il dettaglio completo di una ricetta dato il suo identificativo `idMeal`.[web:295][web:245]

Documentazione ufficiale:
[https://www.themealdb.com/api.php](https://www.themealdb.com/api.php) [web:295]

## Stato globale

Per la gestione dello stato globale è stato usato **React Context**, perché permette di condividere dati tra più schermate senza passare props manualmente lungo tutto l’albero dei componenti. Questo approccio è stato usato soprattutto per i preferiti e per il tema dell’app.[web:299]

Nel progetto il Context viene usato per:

- memorizzare gli ID dei piatti preferiti;
- verificare se un piatto è tra i preferiti;
- aggiungere o rimuovere un preferito;
- gestire il tema light/dark in modo centralizzato.

## Edge case gestiti

Nell’app sono stati gestiti i seguenti casi:

- errore di rete durante il caricamento dei piatti;
- errore di rete durante il recupero del dettaglio di una ricetta;
- ricetta non trovata;
- lista preferiti vuota;
- caricamento iniziale dei dati con indicatore visivo;
- gestione di un eventuale deep link invalido, se configurato.

## Utenti mock per test login

Se il progetto include un login mock, inserire qui gli utenti usati per il test.

| Email / Username | Password | Note |
|---|---|---|
| `demo@example.com` | `demo123` | Sostituire con i dati reali del progetto |

## Deep linking

Se il progetto usa il deep linking, il path previsto può essere:

```text
meal/:idMeal
```

Esempio di test:

```text
exp://<ip-o-url-expo>/--/meal/52772
```

L’ID `idMeal` è coerente con il parametro richiesto dall’endpoint di dettaglio della ricetta.[web:295]

## Feature opzionali

Eventuali funzionalità opzionali implementate:

- salvataggio persistente dei preferiti;
- supporto completo al tema dark/light;
- dettaglio ricetta con ingredienti e istruzioni;
- deep linking verso il dettaglio della ricetta.
