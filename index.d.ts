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
   * Fetches an image payload
   */
  getImage(): Promise<any>;

  /**
   * Starts a new game session
   * @returns Promise containing the game session data
   */
  startGame(): Promise<any>;

  /**
   * Submits a score for a game session
   * @param gameSessionId - The ID of the game session
   * @param score - The score to submit
   * @param metadata - Optional metadata to include with the score
   */
  submitScore(gameSessionId: string, score: number, metadata?: Record<string, any>): Promise<any>;

  /**
   * Starts a new AI duel
   */
  startAiDuel(): Promise<any>;

  /**
   * Submits a guess for an AI duel round
   * @param matchId - The ID of the AI duel match
   * @param roundIndex - The index of the current round
   * @param guess - The guess data
   */
  submitAiGuess(matchId: string, roundIndex: number, guess: any): Promise<any>;

  /**
   * Fetches the leaderboard
   * @param limit - Optional limit for the number of results
   */
  getLeaderboard(limit?: number): Promise<any>;

  /**
   * Checks the health status of the API
   */
  health(): Promise<any>;

  /**
   * Tests the AI endpoint (for development purposes)
   * @param key - The test key
   */
  testAi(key: string): Promise<any>;

  /**
   * Internal method to make API requests
   * @private
   */
  private request(config: RequestConfig, context?: string): Promise<any>;

  /**
   * Ensures an App Check token is set
   * @private
   */
  private ensureAppCheckToken(action: string): void;
}

export = GeoApi;
