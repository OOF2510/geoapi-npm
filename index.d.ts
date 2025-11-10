type RequestConfig = {
  method: 'get' | 'post';
  url: string;
  data?: any;
  params?: Record<string, any>;
};

declare class GeoApi {
  constructor(baseURL?: string, appCheckToken?: string | null);

  /**
   * The base URL of the API
   */
  baseURL: string;

  /**
   * The App Check token for authentication
   */
  appCheckToken: string | null;

  /**
   * Sets the base URL for the API client
   * @param baseURL - The base URL to use for API requests
   */
  setBaseUrl(baseURL: string): void;

  /**
   * Sets the App Check token for authentication
   * @param token - The App Check token
   */
  setAppCheckToken(token: string | null): void;

  /**
   * Ensures an App Check token is set
   * @param action - Description of the action requiring the token
   * @private
   */
  private ensureAppCheckToken(action: string): void;

  /**
   * Internal method to make API requests
   * @param config - Axios-like request configuration
   * @param context - Description of the action for contextual error messages
   * @private
   */
  private request(config: RequestConfig, context?: string): Promise<any>;

  /**
   * Fetches a random street-view image with geographic metadata
   */
  getImage(): Promise<{imageUrl: string, coordinates: {lat: number, lon: number}, countryName: string | null, countryCode: string | null, contributor: string | null}>;

  /**
   * Fetches a random street-view panorama image with geographic metadata
   */
  getPano(): Promise<{imageUrl: string, coordinates: {lat: number, lon: number}, countryName: string | null, countryCode: string | null, contributor: string | null}>;

  /**
   * Starts a new game session
   */
  startGame(): Promise<{gameSessionId: string, seed: string, expiresAt: string}>;

  /**
   * Submits a game score
   * @param gameSessionId - Identifier of the active game session
   * @param score - Score achieved by the player
   * @param metadata - Optional metadata to persist with the score
   */
  submitScore(gameSessionId: string, score: number, metadata?: Record<string, any>): Promise<{ok: boolean}>;

  /**
   * Creates a new AI duel match
   */
  startAiDuel(): Promise<{matchId: string, totalRounds: number, round: {roundIndex: number, imageUrl: string}, scores: {player: number, ai: number}, status: string}>;

  /**
   * Submits a player's guess for an AI duel round
   * @param matchId - Identifier of the AI duel match
   * @param roundIndex - Zero-based index of the round being played
   * @param guess - Player's country guess
   */
  submitAiGuess(matchId: string, roundIndex: number, guess: string): Promise<{matchId: string, roundIndex: number, totalRounds: number, playerResult: {guess: string, normalizedGuess: string, isCorrect: boolean} | null, aiResult: any, correctCountry: {name: string | null, code: string | null}, coordinates: {lat: number, lon: number}, scores: {player: number, ai: number}, status: string, history: any[], nextRound?: {roundIndex: number, imageUrl: string}}>;

  /**
   * Retrieves the leaderboard of top scores
   * @param limit - Optional maximum number of entries to return
   */
  getLeaderboard(limit?: number): Promise<Array<{rank: number, score: number, createdAt: string}>>;

  /**
   * Checks the API health status
   */
  health(): Promise<{status: string, timestamp: string}>;

  /**
   * Calls the testing AI endpoint (development only)
   * @param key - Test key required for authorization
   */
  testAi(key: string): Promise<any>;
}

export = GeoApi;
