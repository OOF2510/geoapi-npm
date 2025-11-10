const DEFAULT_BASE_URL = 'api.geo.oof2510.space';
const axios = require('axios');

function normalizeBaseUrl(url) {
    if (!url) {
        throw new Error('A base URL must be provided.');
    }

    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    return withProtocol.replace(/\/$/, '');
}

function buildError(error, context) {
    const parts = [`Api request failed${context ? ` during ${context}` : ''}`];

    if (error.response) {
        parts.push(`status ${error.response.status}`);
        if (error.response.data) {
            const payload =
                typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            parts.push(`response: ${payload}`);
        }
    } else if (error.request) {
        parts.push('no response received from server');
    } else if (error.message) {
        parts.push(error.message);
    }

    const wrapped = new Error(parts.join(' | '));
    wrapped.status = error.response ? error.response.status : undefined;
    wrapped.original = error;
    return wrapped;
}

/**
 * Client for interacting with the API.
 */
class GeoApi {
    /**
     * Creates a new API client.
     * @param {string} [baseURL=DEFAULT_BASE_URL] - Base URL for the API endpoints.
     * @param {string|null} [appCheckToken=null] - Optional Firebase App Check token.
     */
    constructor(baseURL = DEFAULT_BASE_URL, appCheckToken = null) {
        this.baseURL = normalizeBaseUrl(baseURL);
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
        });
        this.appCheckToken = null;

        if (appCheckToken) {
            this.setAppCheckToken(appCheckToken);
        }
    }

    /**
     * Sets the base URL for subsequent API requests.
     * @param {string} baseURL - The base URL to target for API requests.
     */
    setBaseUrl(baseURL) {
        this.baseURL = normalizeBaseUrl(baseURL);
        this.client.defaults.baseURL = this.baseURL;
    }

    /**
     * Sets or clears the Firebase App Check token header.
     * @param {string|null} token - The App Check token to send with requests, or null to remove it.
     */
    setAppCheckToken(token) {
        this.appCheckToken = token;
        if (token) {
            this.client.defaults.headers.common['X-Firebase-AppCheck'] = token;
        } else {
            delete this.client.defaults.headers.common['X-Firebase-AppCheck'];
        }
    }

    /**
     * Ensures an App Check token is present before performing a protected action.
     * @param {string} action - Description of the action requiring the token.
     * @throws {Error} If no App Check token has been configured.
     * @private
     */
    ensureAppCheckToken(action) {
        if (!this.appCheckToken) {
            throw new Error(
                `An App Check token is required to ${action}. Call setAppCheckToken(token) first.`,
            );
        }
    }

    /**
     * Executes an HTTP request against the API.
     * @param {{method: 'get' | 'post', url: string, data?: any, params?: Record<string, any>}} config - Axios-like request configuration.
     * @param {string} [context] - Description of the action for contextual error messages.
     * @returns {Promise<any>} Resolved response payload from the API.
     * @private
     */
    async request(config, context) {
        try {
            const response = await this.client.request(config);
            return response.data;
        } catch (error) {
            throw buildError(error, context);
        }
    }

    /**
     * Fetches a random street-view image with geographic metadata.
     * @returns {Promise<{imageUrl: string, coordinates: {lat: number, lon: number}, countryName: string|null, countryCode: string|null, contributor: string|null}>} Image and location details.
     */
    async getImage() {
        return this.request({ method: 'get', url: '/getImage' }, 'fetch image payload');
    }

    /**
     * Fetches a random street-view panorama image with geographic metadata.
     * @returns {Promise<{imageUrl: string, coordinates: {lat: number, lon: number}, countryName: string|null, countryCode: string|null, contributor: string|null}>} Image and location details.
     */
    async getPano() {
        return this.request({ method: 'get', url: '/getPano' }, 'fetch panorama image payload');
    }

    /**
     * Starts a new game session.
     * @returns {Promise<{gameSessionId: string, seed: string, expiresAt: string}>} Game session metadata.
     */
    async startGame() {
        this.ensureAppCheckToken('start a game');
        return this.request({ method: 'post', url: '/game/start' }, 'start game');
    }

    /**
     * Submits a game score.
     * @param {string} gameSessionId - Identifier of the active game session.
     * @param {number} score - Score achieved by the player.
     * @param {Record<string, any>} [metadata={}] - Optional metadata to persist with the score.
     * @returns {Promise<{ok: boolean}>} Submission result.
     */
    async submitScore(gameSessionId, score, metadata = {}) {
        this.ensureAppCheckToken('submit a score');
        if (!gameSessionId) {
            throw new Error('gameSessionId is required to submit a score.');
        }
        if (typeof score !== 'number') {
            throw new Error('score must be provided as a number.');
        }

        return this.request(
            {
                method: 'post',
                url: '/game/submit',
                data: { gameSessionId, score, metadata },
            },
            'submit score',
        );
    }

    /**
     * Creates a new AI duel match.
     * @returns {Promise<{matchId: string, totalRounds: number, round: {roundIndex: number, imageUrl: string}, scores: {player: number, ai: number}, status: string}>} Match information.
     */
    async startAiDuel() {
        this.ensureAppCheckToken('start an AI duel');
        return this.request({ method: 'post', url: '/ai-duel/start' }, 'start AI duel');
    }

    /**
     * Submits a player's guess for an AI duel round.
     * @param {string} matchId - Identifier of the AI duel match.
     * @param {number} roundIndex - Zero-based index of the round being played.
     * @param {string} guess - Player's country guess.
     * @returns {Promise<{matchId: string, roundIndex: number, totalRounds: number, playerResult: {guess: string, normalizedGuess: string, isCorrect: boolean}|null, aiResult: any, correctCountry: {name: string|null, code: string|null}, coordinates: {lat: number, lon: number}, scores: {player: number, ai: number}, status: string, history: any[], nextRound?: {roundIndex: number, imageUrl: string}}>} Round resolution details.
     */
    async submitAiGuess(matchId, roundIndex, guess) {
        this.ensureAppCheckToken('submit an AI duel guess');
        if (!matchId) {
            throw new Error('matchId is required to submit an AI duel guess.');
        }
        if (typeof roundIndex !== 'number' || roundIndex < 0) {
            throw new Error('roundIndex must be a non-negative number.');
        }

        return this.request(
            {
                method: 'post',
                url: '/ai-duel/guess',
                data: { matchId, roundIndex, guess },
            },
            'submit AI duel guess',
        );
    }

    /**
     * Retrieves the leaderboard of top scores.
     * @param {number} [limit] - Optional maximum number of entries to return.
     * @returns {Promise<Array<{rank: number, score: number, createdAt: string}>>} Leaderboard standings.
     */
    async getLeaderboard(limit) {
        return this.request(
            {
                method: 'get',
                url: '/leaderboard/top',
                params: limit ? { limit } : undefined,
            },
            'fetch leaderboard',
        );
    }

    /**
     * Checks the API health status.
     * @returns {Promise<{status: string, timestamp: string}>} Health details.
     */
    async health() {
        return this.request({ method: 'get', url: '/health' }, 'fetch health status');
    }

    /**
     * Calls the testing AI endpoint (development only).
     * @param {string} key - Test key required for authorization.
     * @returns {Promise<any>} AI diagnostic payload.
     */
    async testAi(key) {
        if (!key) {
            throw new Error('A testing key is required to call the test AI endpoint.');
        }

        return this.request(
            {
                method: 'get',
                url: '/test-ai',
                params: { key },
            },
            'test AI endpoint',
        );
    }
}

module.exports = GeoApi;