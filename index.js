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

class GeoApi {
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

    setBaseUrl(baseURL) {
        this.baseURL = normalizeBaseUrl(baseURL);
        this.client.defaults.baseURL = this.baseURL;
    }

    setAppCheckToken(token) {
        this.appCheckToken = token;
        if (token) {
            this.client.defaults.headers.common['X-Firebase-AppCheck'] = token;
        } else {
            delete this.client.defaults.headers.common['X-Firebase-AppCheck'];
        }
    }

    ensureAppCheckToken(action) {
        if (!this.appCheckToken) {
            throw new Error(
                `An App Check token is required to ${action}. Call setAppCheckToken(token) first.`,
            );
        }
    }

    async request(config, context) {
        try {
            const response = await this.client.request(config);
            return response.data;
        } catch (error) {
            throw buildError(error, context);
        }
    }

    async getImage() {
        return this.request({ method: 'get', url: '/getImage' }, 'fetch image payload');
    }

    async startGame() {
        this.ensureAppCheckToken('start a game');
        return this.request({ method: 'post', url: '/game/start' }, 'start game');
    }

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

    async startAiDuel() {
        this.ensureAppCheckToken('start an AI duel');
        return this.request({ method: 'post', url: '/ai-duel/start' }, 'start AI duel');
    }

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

    async health() {
        return this.request({ method: 'get', url: '/health' }, 'fetch health status');
    }

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