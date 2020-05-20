import React, {useState, useEffect} from 'react';
import uuidv1 from 'uuid/v1';
import {Row, Col, FormGroup, Form} from 'shards-react';
import {useHistory, useLocation} from 'react-router-dom';
import '../../styles/login.css';
import {WEBSOCKET_SOURCE} from "../../services/websocket-connection";
import {UserForm, AuthTypeForm, EnvironmentForm, LoginButtons} from '../login-form';
import OAuth2Service from '../../services/oauth2-service';

export const AUTH_TYPE = {
  OAUTH: 'oauth',
  CREDENTIALS: 'login'
};

const AUTH_ERRORS = {
  "error.security.invalid-details": "Username or password is incorrect"
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Login({preTradeService, tradeService, authService, message, onLoginSuccessful, isLoginSuccessful, onWebsocketEnvChanged, isConnected}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [accountId, setAccountId] = useState('');
  const [authType, setAuthType] = useState(AUTH_TYPE.OAUTH);
  const [error, setError] = useState('');
  const history = useHistory();
  const location = useLocation();
  const queryParams = useQuery();
  const [ oauth2Service ] = useState(new OAuth2Service());
  const code = queryParams.get('code');
  const token = oauth2Service.getAccessToken();
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  useEffect(() => {
    if (oauth2Service && queryParams) {
      setIsLoggedIn(code || token);
    }
  }, [token, code, oauth2Service, queryParams]);

  useEffect(() => {
    if (code && oauth2Service && preTradeService && tradeService && isConnected) {
      oauth2Service.getOAuthToken(code);
    }
  }, [code, oauth2Service, preTradeService, tradeService, isConnected]);

  useEffect(() => {
    if (!code && oauth2Service && preTradeService && tradeService && isConnected) {
      oauth2Service.getRefreshToken();
    }
  }, [code, oauth2Service, preTradeService, tradeService, isConnected]);

  useEffect(() => {
    const {MessageType, Source} = message;
    if (preTradeService && tradeService && MessageType && Source) {
      let service;
      if (Source === WEBSOCKET_SOURCE.PRE_TRADE) {
        service = preTradeService;
      } else if (Source === WEBSOCKET_SOURCE.TRADE) {
        service = tradeService;
      }

      switch (MessageType) {
        case "NegotiationResponse":
          service.sendEstablish(message.SessionId, +process.env.REACT_APP_CLIENT_HEARTBEAT);
          break;
        case "EstablishmentAck":
          service.startHeartbeat();
          onLoginSuccessful({ Source, accountId });
          break;
        case "NegotiationReject":
          setError("Username or password is incorrect");
          break;
        default:
      }
    } else if (!isConnected) {
      if (authService && oauth2Service) {
        authService.stopTokenRefresh();
        oauth2Service.stopTokenRefresh();
      }
    }
  }, [preTradeService, tradeService, authService, message, isConnected, accountId, onLoginSuccessful, oauth2Service]);

  useEffect(() => {
    if (isLoginSuccessful) {
      const {from} = location.state || {from: {pathname: "/trade"}};
      history.replace(from);
    }
  }, [isLoginSuccessful, history, location]);

  async function handleNegotiate() {
    if (token) {
      preTradeService.sendNegotiate(uuidv1(), AUTH_TYPE.OAUTH, oauth2Service.getAccessToken());
      tradeService.sendNegotiate(uuidv1(), AUTH_TYPE.OAUTH, oauth2Service.getAccessToken());
    } else {
      if (preTradeService && identifier && password && accountId) {
        try {
          setError('');
          let token = await fetchToken();
          preTradeService.sendNegotiate(uuidv1(), authType, token);
          tradeService.sendNegotiate(uuidv1(), authType, token);
        } catch ({response: {data: {errorCode}}}) {
          AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
        }
      }
    }
  }

  async function fetchToken() {
    try {
      setError('');
      let token = null;
      if (authType === AUTH_TYPE.CREDENTIALS) {
        token = `${identifier}:${password}`;
      } else {
        token = await authService.getOAuthToken(identifier, password);
      }

      return token;
    } catch ({response: {data: {errorCode}}}) {
      AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
    }
  }

  return (
    <div className="login-container">
      <Row>
        <Col></Col>
        <Col>
          <div>
            <h3>Login</h3>
            <Form>
              <FormGroup>
                <UserForm
                  identifier={identifier}
                  password={password}
                  accountId={accountId}
                  showOnlyAccountId={isLoggedIn}
                  onIdentifierChanged={(id) => setIdentifier(id)}
                  onPasswordChanged={(pass) => setPassword(pass)}
                  onAccountIdChanged={(accountId) => setAccountId(accountId)}
                />
                <AuthTypeForm
                  onAuthTypeChanged={(t) => setAuthType(t)}
                />
                <EnvironmentForm
                  onEnvChange={(env) => onWebsocketEnvChanged(env)}
                />
                <LoginButtons
                  onClick={handleNegotiate}
                  isLoggedIn={isLoggedIn}
                />
              </FormGroup>
            </Form>
          </div>
          {error && <div>{error}</div>}
        </Col>
        <Col></Col>
      </Row>
    </div>
  )
}
