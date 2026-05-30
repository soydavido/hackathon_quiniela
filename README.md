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
    "hasQuiniela": true,
    "quinielaSubmitted": true,
    "createdAt": "2026-05-30T10:00:00.000Z"
  },
  {
    "idParticipant": 2,
    "name": "María López",
    "teamId": 1,
    "hasQuiniela": false,
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
Bracket completo del torneo con las 5 fases. Las rondas que aún no están definidas aparecen con `status: "tbd"` y todos sus campos en `null`. Útil para renderizar el bracket gráfico.

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
          "idMatch": null,
          "matchOrder": null,
          "homeTeam": null,
          "awayTeam": null,
          "matchDate": null,
          "status": "tbd",
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

| Campo `status` | Significado |
|----------------|-------------|
| `pending` | Partido definido, aún no jugado |
| `finished` | Partido jugado, resultado registrado |
| `tbd` | Ronda no definida aún (equipos por determinar) |

---

### 📝 Quiniela

#### `POST /quiniela`
Registra la quiniela completa de un participante. **Solo se puede enviar una vez — no puede modificarse después.**

El `predictedWinnerId` debe ser el `idFootballTeam` de `homeTeam` o `awayTeam` del partido correspondiente. Solo se pueden predecir partidos con `status: "pending"`.

**Headers:**
```
x-team-token: TEAM-TOKEN-001
```

**Request body:**
```json
{
  "participantId": 1,
  "predictions": [
    { "matchId": 1, "predictedWinnerId": 1 },
    { "matchId": 2, "predictedWinnerId": 3 },
    { "matchId": 3, "predictedWinnerId": 5 },
    { "matchId": 4, "predictedWinnerId": 7 },
    { "matchId": 5, "predictedWinnerId": 9 },
    { "matchId": 6, "predictedWinnerId": 11 },
    { "matchId": 7, "predictedWinnerId": 13 },
    { "matchId": 8, "predictedWinnerId": 15 }
  ]
}
```

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
| `400` | `"El equipo con id 99 no juega en el partido 1. Equipos válidos: 1, 2."` |
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
          "idMatch": null,
          "matchOrder": null,
          "homeTeam": null,
          "awayTeam": null,
          "matchDate": null,
          "status": "tbd",
          "winner": null,
          "prediction": null
        }
      ]
    }
  ]
}
```

> `isCorrect: null` → partido aún no tiene resultado.
> `prediction: null` → el participante no predijo ese partido (ej. rondas TBD al momento de enviar).

**Errores:**
| Código | Mensaje |
|--------|---------|
| `404` | `"Participante no encontrado en este equipo."` |
| `404` | `"Este participante no tiene quiniela registrada."` |

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
