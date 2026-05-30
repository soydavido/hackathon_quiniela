# 🏆 Hackathon API — Quiniela del Mundial

API REST para el Cuarto Hackathon de Espacio Educa (2026). Permite gestionar equipos, participantes, quinielas y leaderboards para una aplicación de predicciones del Mundial.

**Stack:** NestJS · TypeScript · Fastify · TypeORM · PostgreSQL

---

## ⚙️ Configuración

```bash
cp .env.example .env   # ajustar credenciales de BD
npm install
npm run start:dev
```

Con `DB_SYNCHRONIZE=true` las tablas se crean automáticamente al iniciar.

**Base URL:** `http://localhost:3000`

---

## 🔐 Autenticación

Todos los endpoints requieren el header:

```
x-team-token: <token-del-equipo>
```

> El token de tu equipo te lo proporciona el organizador del hackathon.

---

## 🗺️ Flujo recomendado

```
1. POST /participants               → registrar tu participante con el token del equipo
2. GET  /matches/bracket            → ver el bracket completo con los enfrentamientos
3. POST /quiniela                   → registrar tu quiniela (una sola vez, no se puede modificar)
4. GET  /quiniela/:participantId    → ver tu quiniela con predicciones y resultados
5. GET  /leaderboard/token          → ranking de tu equipo
6. GET  /leaderboard/general        → ranking global
```

---

## 📋 Endpoints

---

### ⚽ Equipos de Fútbol

#### `GET /football-teams`
Lista todos los equipos de fútbol del torneo con nombre, código de país y bandera.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  {
    "idFootballTeam": 1,
    "name": "Argentina",
    "countryCode": "AR",
    "flagUrl": "https://flagcdn.com/w320/ar.png"
  },
  {
    "idFootballTeam": 2,
    "name": "Ecuador",
    "countryCode": "EC",
    "flagUrl": "https://flagcdn.com/w320/ec.png"
  }
]
```

---

### 👥 Participantes

#### `POST /participants`
Crea un participante asociado al equipo del token.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Request body:**
```json
{
  "name": "Carlos Pérez"
}
```

**Response `201`:**
```json
{
  "idParticipant": 1,
  "name": "Carlos Pérez",
  "teamId": 1,
  "createdAt": "2026-05-30T10:00:00.000Z"
}
```

**Errores:**
| Código | Mensaje |
|--------|---------|
| `400` | `"Ya existe un participante con el nombre "Carlos Pérez" en este equipo."` |
| `401` | `"Token de equipo no válido."` |

---

#### `GET /participants`
Lista todos los participantes del equipo, indicando si ya enviaron su quiniela.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  {
    "idParticipant": 1,
    "name": "Carlos Pérez",
    "teamId": 1,
    "quinielaSubmitted": true,
    "createdAt": "2026-05-30T10:00:00.000Z"
  },
  {
    "idParticipant": 2,
    "name": "María López",
    "teamId": 1,
    "quinielaSubmitted": false,
    "createdAt": "2026-05-30T10:05:00.000Z"
  }
]
```

---

### 🗓️ Partidos

#### `GET /matches`
Lista plana de todos los partidos creados, ordenados por `matchOrder`.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  {
    "idMatch": 1,
    "matchOrder": 1,
    "homeTeam": {
      "idFootballTeam": 1,
      "name": "Argentina",
      "countryCode": "AR",
      "flagUrl": "https://flagcdn.com/w320/ar.png"
    },
    "awayTeam": {
      "idFootballTeam": 2,
      "name": "Ecuador",
      "countryCode": "EC",
      "flagUrl": "https://flagcdn.com/w320/ec.png"
    },
    "matchDate": "2026-07-10T18:00:00.000Z",
    "status": "pending",
    "winner": null
  }
]
```

---

#### `GET /matches/bracket`
Bracket completo del torneo con las 5 fases y los 16 partidos. Desde el inicio todos los partidos existen en el sistema — los de rondas posteriores son placeholders con `homeTeam: null` y `awayTeam: null` hasta que se conozcan los clasificados. Útil para renderizar el bracket gráfico.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
{
  "bracket": [
    {
      "stage": "octavos",
      "matches": [
        {
          "idMatch": 1,
          "matchOrder": 1,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 2, "name": "Ecuador", "countryCode": "EC", "flagUrl": "https://flagcdn.com/w320/ec.png" },
          "matchDate": "2026-07-10T18:00:00.000Z",
          "status": "pending",
          "winner": null
        }
      ]
    },
    {
      "stage": "cuartos",
      "matches": [
        {
          "idMatch": 9,
          "matchOrder": 9,
          "homeTeam": null,
          "awayTeam": null,
          "matchDate": "2026-07-17T18:00:00.000Z",
          "status": "pending",
          "winner": null
        }
      ]
    },
    { "stage": "semifinal", "matches": [ ... ] },
    { "stage": "tercer_lugar", "matches": [ ... ] },
    { "stage": "final", "matches": [ ... ] }
  ]
}
```

> Los partidos placeholder tienen `homeTeam: null` y `awayTeam: null` hasta que el organizador defina los clasificados. Sin embargo, **siempre tienen un `idMatch` real** que se usa para enviar predicciones.

| Campo `status` | Significado |
|----------------|-------------|
| `pending` | Partido definido o placeholder, aún no jugado |
| `finished` | Partido jugado, resultado registrado |

---

### 📝 Quiniela

#### `POST /quiniela`
Registra la quiniela completa de un participante. **Solo se puede enviar una vez — no puede modificarse después.**

La quiniela cubre los **16 partidos del bracket completo** (octavos hasta final). Todos los partidos existen en el sistema desde el inicio — los de rondas posteriores son placeholders sin equipos definidos aún.

**Reglas de validación por tipo de partido:**
- **Octavos** (equipos definidos): `predictedWinnerId` debe ser `homeTeam` o `awayTeam` del partido.
- **Cuartos en adelante** (placeholder sin equipos): `predictedWinnerId` acepta cualquier `idFootballTeam` de los 16 equipos del torneo.

**Cómo obtener los `matchId`:** consulta `GET /matches/bracket` y usa el campo `idMatch` de cada partido. Los `idFootballTeam` se obtienen de `GET /football-teams`.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Request body:**
```json
{
  "participantId": 1,
  "predictions": [
    { "matchId": 1,  "predictedWinnerId": 2  },
    { "matchId": 2,  "predictedWinnerId": 3  },
    { "matchId": 3,  "predictedWinnerId": 5  },
    { "matchId": 4,  "predictedWinnerId": 8  },
    { "matchId": 5,  "predictedWinnerId": 10 },
    { "matchId": 6,  "predictedWinnerId": 11 },
    { "matchId": 7,  "predictedWinnerId": 13 },
    { "matchId": 8,  "predictedWinnerId": 15 },
    { "matchId": 9,  "predictedWinnerId": 3  },
    { "matchId": 10, "predictedWinnerId": 5  },
    { "matchId": 11, "predictedWinnerId": 9  },
    { "matchId": 12, "predictedWinnerId": 13 },
    { "matchId": 13, "predictedWinnerId": 5  },
    { "matchId": 14, "predictedWinnerId": 9  },
    { "matchId": 15, "predictedWinnerId": 3  },
    { "matchId": 16, "predictedWinnerId": 9  }
  ]
}
```

> Los `matchId` son los `idMatch` reales que devuelve `GET /matches/bracket`. Los IDs del ejemplo asumen inserción en orden — siempre confirma los IDs reales antes de enviar.

> Los `predictedWinnerId` del ejemplo son ilustrativos. Consulta `GET /football-teams` para ver los IDs reales de cada equipo.

**Response `201`:**
```json
{
  "message": "Quiniela registrada exitosamente."
}
```

**Errores:**
| Código | Mensaje |
|--------|---------|
| `400` | `"Este participante ya registró su quiniela y no puede modificarla."` |
| `400` | `"El partido con id 1 ya finalizó y no puede predecirse."` |
| `400` | `"El equipo con id 99 no juega en el partido 1. Equipos válidos: 1, 2."` (octavos) |
| `400` | `"El equipo con id 99 no existe en el torneo."` (cuartos en adelante) |
| `400` | `"El partido con id 99 no existe."` |
| `404` | `"Participante no encontrado en este equipo."` |

---

#### `GET /quiniela/:participantId`
Devuelve la quiniela del participante en formato bracket, con la predicción superpuesta en cada partido y el resultado de cada acierto.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
{
  "participant": { "idParticipant": 1, "name": "Carlos Pérez" },
  "submitted": true,
  "score": 3,
  "bracket": [
    {
      "stage": "octavos",
      "matches": [
        {
          "idMatch": 1,
          "matchOrder": 1,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 2, "name": "Ecuador", "countryCode": "EC", "flagUrl": "https://flagcdn.com/w320/ec.png" },
          "matchDate": "2026-07-10T18:00:00.000Z",
          "status": "finished",
          "winner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "prediction": {
            "idPrediction": 5,
            "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
            "isCorrect": true
          }
        }
      ]
    },
    {
      "stage": "cuartos",
      "matches": [
        {
          "idMatch": 9,
          "matchOrder": 9,
          "homeTeam": null,
          "awayTeam": null,
          "matchDate": "2026-07-17T18:00:00.000Z",
          "status": "pending",
          "winner": null,
          "prediction": {
            "idPrediction": 6,
            "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
            "isCorrect": null
          }
        }
      ]
    }
  ]
}
```

> `isCorrect: null` → el partido aún no tiene resultado registrado.
> `homeTeam: null / awayTeam: null` → los equipos clasificados aún no han sido definidos por el organizador.
> `prediction: null` → el participante no envió predicción para ese partido.

**Errores:**
| Código | Mensaje |
|--------|---------|
| `404` | `"Participante no encontrado en este equipo."` |
| `404` | `"Este participante no tiene quiniela registrada."` |

---

#### `GET /quiniela/mock`
Devuelve una quiniela de ejemplo con data completa para probar la interfaz gráfica sin necesidad de tener datos reales en la base de datos. No requiere `participantId` ni datos en BD.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
{
  "participant": { "idParticipant": 1, "name": "Carlos Pérez" },
  "submitted": true,
  "score": 6,
  "bracket": [
    {
      "stage": "octavos",
      "matches": [
        {
          "idMatch": 1, "matchOrder": 1,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 2, "name": "Ecuador", "countryCode": "ec", "flagUrl": "https://flagcdn.com/w320/ec.png" },
          "matchDate": "2026-07-10T18:00:00.000Z",
          "status": "finished",
          "winner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "prediction": { "idPrediction": 10, "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" }, "isCorrect": true }
        },
        {
          "idMatch": 3, "matchOrder": 3,
          "homeTeam": { "idFootballTeam": 5, "name": "España", "countryCode": "es", "flagUrl": "https://flagcdn.com/w320/es.png" },
          "awayTeam": { "idFootballTeam": 6, "name": "Marruecos", "countryCode": "ma", "flagUrl": "https://flagcdn.com/w320/ma.png" },
          "matchDate": "2026-07-11T18:00:00.000Z",
          "status": "finished",
          "winner": { "idFootballTeam": 5, "name": "España", "countryCode": "es", "flagUrl": "https://flagcdn.com/w320/es.png" },
          "prediction": { "idPrediction": 30, "predictedWinner": { "idFootballTeam": 6, "name": "Marruecos", "countryCode": "ma", "flagUrl": "https://flagcdn.com/w320/ma.png" }, "isCorrect": false }
        },
        {
          "idMatch": 5, "matchOrder": 5,
          "homeTeam": { "idFootballTeam": 9, "name": "Alemania", "countryCode": "de", "flagUrl": "https://flagcdn.com/w320/de.png" },
          "awayTeam": { "idFootballTeam": 10, "name": "Suiza", "countryCode": "ch", "flagUrl": "https://flagcdn.com/w320/ch.png" },
          "matchDate": "2026-07-12T18:00:00.000Z",
          "status": "finished",
          "winner": { "idFootballTeam": 9, "name": "Alemania", "countryCode": "de", "flagUrl": "https://flagcdn.com/w320/de.png" },
          "prediction": { "idPrediction": 50, "predictedWinner": { "idFootballTeam": 9, "name": "Alemania", "countryCode": "de", "flagUrl": "https://flagcdn.com/w320/de.png" }, "isCorrect": true }
        }
      ]
    },
    {
      "stage": "cuartos",
      "matches": [
        {
          "idMatch": 9, "matchOrder": 9,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 3, "name": "Brasil", "countryCode": "br", "flagUrl": "https://flagcdn.com/w320/br.png" },
          "matchDate": "2026-07-17T18:00:00.000Z",
          "status": "finished",
          "winner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "prediction": { "idPrediction": 90, "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" }, "isCorrect": true }
        },
        {
          "idMatch": 12, "matchOrder": 12,
          "homeTeam": { "idFootballTeam": 14, "name": "Colombia", "countryCode": "co", "flagUrl": "https://flagcdn.com/w320/co.png" },
          "awayTeam": { "idFootballTeam": 15, "name": "Países Bajos", "countryCode": "nl", "flagUrl": "https://flagcdn.com/w320/nl.png" },
          "matchDate": "2026-07-18T22:00:00.000Z",
          "status": "pending",
          "winner": null,
          "prediction": { "idPrediction": 120, "predictedWinner": { "idFootballTeam": 15, "name": "Países Bajos", "countryCode": "nl", "flagUrl": "https://flagcdn.com/w320/nl.png" }, "isCorrect": null }
        }
      ]
    },
    {
      "stage": "semifinal",
      "matches": [
        {
          "idMatch": 13, "matchOrder": 13,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 7, "name": "Francia", "countryCode": "fr", "flagUrl": "https://flagcdn.com/w320/fr.png" },
          "matchDate": "2026-07-21T22:00:00.000Z",
          "status": "pending",
          "winner": null,
          "prediction": { "idPrediction": 130, "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" }, "isCorrect": null }
        }
      ]
    },
    {
      "stage": "tercer_lugar",
      "matches": [
        {
          "idMatch": 15, "matchOrder": 15,
          "homeTeam": { "idFootballTeam": 7, "name": "Francia", "countryCode": "fr", "flagUrl": "https://flagcdn.com/w320/fr.png" },
          "awayTeam": { "idFootballTeam": 11, "name": "Portugal", "countryCode": "pt", "flagUrl": "https://flagcdn.com/w320/pt.png" },
          "matchDate": "2026-07-25T18:00:00.000Z",
          "status": "pending",
          "winner": null,
          "prediction": { "idPrediction": 150, "predictedWinner": { "idFootballTeam": 11, "name": "Portugal", "countryCode": "pt", "flagUrl": "https://flagcdn.com/w320/pt.png" }, "isCorrect": null }
        }
      ]
    },
    {
      "stage": "final",
      "matches": [
        {
          "idMatch": 16, "matchOrder": 16,
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 15, "name": "Países Bajos", "countryCode": "nl", "flagUrl": "https://flagcdn.com/w320/nl.png" },
          "matchDate": "2026-07-26T22:00:00.000Z",
          "status": "pending",
          "winner": null,
          "prediction": { "idPrediction": 160, "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "ar", "flagUrl": "https://flagcdn.com/w320/ar.png" }, "isCorrect": null }
        }
      ]
    }
  ]
}
```

> El response completo incluye los 16 partidos. Se muestran aquí los más representativos de cada estado posible.

---

#### `GET /quiniela/results`
Resultados y estadísticas de todas las quinielas del equipo (token).

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  {
    "participant": { "idParticipant": 1, "name": "Carlos Pérez" },
    "submitted": true,
    "score": 7,
    "stats": {
      "totalPredictions": 8,
      "correct": 5,
      "incorrect": 2,
      "pending": 1
    },
    "predictions": [
      {
        "idPrediction": 1,
        "predictedWinner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
        "isCorrect": true,
        "match": {
          "idMatch": 1,
          "stage": "octavos",
          "homeTeam": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" },
          "awayTeam": { "idFootballTeam": 2, "name": "Ecuador", "countryCode": "EC", "flagUrl": "https://flagcdn.com/w320/ec.png" },
          "status": "finished",
          "winner": { "idFootballTeam": 1, "name": "Argentina", "countryCode": "AR", "flagUrl": "https://flagcdn.com/w320/ar.png" }
        }
      }
    ]
  }
]
```

---

#### `GET /quiniela/results/:participantId`
Resultados de la quiniela de un participante específico.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:** misma estructura que un elemento de `GET /quiniela/results`.

**Errores:**
| Código | Mensaje |
|--------|---------|
| `404` | `"Participante no encontrado en este equipo."` |
| `404` | `"Este participante no tiene quiniela registrada."` |

---

### 🏅 Leaderboard

#### `GET /leaderboard/token`
Ranking de los participantes del equipo identificado por el token, ordenado de mayor a menor puntaje.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  { "idParticipant": 1, "name": "Carlos Pérez", "score": 12, "submitted": true },
  { "idParticipant": 2, "name": "María López", "score": 8, "submitted": true },
  { "idParticipant": 3, "name": "Luis Gómez", "score": 0, "submitted": false }
]
```

---

#### `GET /leaderboard/general`
Ranking global con todos los participantes de todos los equipos.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Response `200`:**
```json
[
  { "idParticipant": 5, "name": "Ana Martínez", "teamName": "Equipo 3", "score": 15, "submitted": true },
  { "idParticipant": 1, "name": "Carlos Pérez", "teamName": "Equipo 1", "score": 12, "submitted": true }
]
```

---

## 🎯 Sistema de puntaje

El puntaje se calcula automáticamente cuando el admin registra el resultado de un partido.

| Etapa | Puntos por acierto |
|-------|--------------------|
| ⚽ Octavos de final | 1 pt |
| 🏟️ Cuartos de final | 2 pts |
| 🔥 Semifinal | 3 pts |
| 🥉 Tercer lugar | 2 pts |
| 🏆 Final | 4 pts |

---

## ❌ Formato de errores

```json
{
  "statusCode": 400,
  "message": "Descripción del error.",
  "timestamp": "2026-05-30T10:00:00.000Z",
  "path": "/quiniela"
}
```

| Código | Causa general |
|--------|---------------|
| `400` | Validación fallida o estado inválido |
| `401` | Header de autenticación ausente o incorrecto |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |
