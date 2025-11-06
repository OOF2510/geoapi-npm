# GeoAPI Client

An npm module wrapper for my [geoguess-api](https://github.com/oof2510/geoguess-api). You can use unprotected endpoints, or use your own deployment of the API with Firebase App Check.

## Installation

npm
```bash
npm install @oof2510/geoapi
```

## Usage

CommonJS:
```javascript
const GeoApi = require('@oof2510/geoapi');

// Initialize with default URL or provide a custom one for protected endpoints
const geoApi = new GeoApi('your-custom-api-url', 'your-app-check-token');

// Or set the App Check token later
geoApi.setAppCheckToken('your-app-check-token');
```

ES6/TypeScript:
```typescript
import GeoApi from '@oof2510/geoapi';

// Initialize with default URL or provide a custom one for protected endpoints
const geoApi = new GeoApi('your-custom-api-url', 'your-app-check-token');

// Or set the App Check token later
geoApi.setAppCheckToken('your-app-check-token');
```

### Constructor

#### `new GeoApi(baseURL?, appCheckToken?)`

Creates a new GeoAPI client instance.

- `baseURL` (string, optional): The base URL of the GeoAPI service. Defaults to `'api.geo.oof2510.space'`.
- `appCheckToken` (string, optional): Firebase App Check token for authentication.

### Methods

#### `setBaseUrl(baseURL)`

Sets the base URL for API requests.

- `baseURL` (string): The base URL to use for API requests.

#### `setAppCheckToken(token)`

Sets the App Check token for protected endpoints.

- `token` (string | null): The App Check token or null to remove the token.

#### `getImage()`

Gets a random image with metadata

**Returns:** Promise<any>

#### `startGame()` (Protected)

Starts a new game session.

**Returns:** Promise<any>

#### `submitScore(gameSessionId, score, metadata?)` (Protected)

Submits a score for a game session.

- `gameSessionId` (string): The ID of the game session.
- `score` (number): The score to submit.
- `metadata` (object, optional): Additional metadata to include with the score.

**Returns:** Promise<any>

#### `startAiDuel()` (Protected)

Starts a new AI duel.

**Returns:** Promise<any>

#### `submitAiGuess(matchId, roundIndex, guess)` (Protected)

Submits a guess for an AI duel round.

- `matchId` (string): The ID of the AI duel match.
- `roundIndex` (number): The index of the current round.
- `guess` (any): The guess data.

**Returns:** Promise<any>

#### `getLeaderboard(limit?)`

Fetches the leaderboard.

- `limit` (number, optional): Maximum number of results to return.

**Returns:** Promise<any>

#### `health()`

Checks the health status of the API.

**Returns:** Promise<any>

#### `testAi(key)` (Protected with dev key)

Tests the AI endpoint (for development purposes).

- `key` (string): The test key.

**Returns:** Promise<any>

## Error Handling

The library throws errors with the following properties:

- `message`: A descriptive error message
- `status`: The HTTP status code (if available)
- `original`: The original error object

## License

MPL-2.0
