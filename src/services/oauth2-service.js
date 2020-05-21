import axios from 'axios';

const OAUTH2_URL = process.env.REACT_APP_OAUTH2_URL;

export default class OAuth2Service {
  accessToken = null;
  timeoutId = null;
  client = axios.create({ withCredentials: true, baseURL: OAUTH2_URL });

  async getOAuthToken(code) {
    const response = await this.client.post('/token', { code });
    if (response.data) {
      const { access_token, expires_in } = response.data;
      this.accessToken = access_token;
      this.getRefreshToken(this._toMilliseconds(expires_in));
      return access_token;
    }
  }

  async getRefreshToken(expires_in) {
    if (!expires_in) {
        return await this.fetchNewToken();
    } else {
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(async () => {
          await this.fetchNewToken();
        }, expires_in);
      }
    }
  }

  async fetchNewToken() {
    const response = await this.client.get('/refresh');
    const { data: { access_token, expires_in } } = response;
    this.accessToken = access_token;
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.getRefreshToken(this._toMilliseconds(expires_in));
  }

  stopTokenRefresh() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  _toMilliseconds(num) {
    return +num * 1000;
  }
}

