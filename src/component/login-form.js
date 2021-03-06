import React, {useState} from 'react';
import InputField from './ui/input-field';
import {FormSelect, Container, Row, Col, Button} from 'shards-react';
import { AUTH_TYPE } from './pages/login';
import OAuthButton from './oauth2-button';

export function UserForm({ identifier, password, accountId, showOnlyAccountId, onIdentifierChanged, onPasswordChanged, onAccountIdChanged }) {
  return (
    <div className="user-form">
      {!showOnlyAccountId &&
      <div>
        <InputField
          autoComplete="on"
          value={identifier}
          labelName={"Username"}
          id="username"
          type="text"
          onChange={(e) => onIdentifierChanged(e.target.value)}
          onInput={(e) => onIdentifierChanged(e.target.value)}/>
        <InputField
          autoComplete="on"
          value={password}
          labelName={"Password"}
          id="password"
          type="password"
          onChange={(e) => onPasswordChanged(e.target.value)}
          onInput={(e) => onPasswordChanged(e.target.value)}/>
      </div>
      }
      <InputField
        autoComplete="on"
        value={accountId}
        labelName={"Account ID"}
        id="account-id"
        type="text"
        onChange={(e) => onAccountIdChanged(e.target.value)}
        onInput={(e) => onAccountIdChanged(e.target.value)}/>
    </div>
  );
}

export function AuthTypeForm({ onAuthTypeChanged }) {
  const [ authTypes ] = useState([
    { value: AUTH_TYPE.OAUTH, displayValue: 'OAuth' },
    { value: AUTH_TYPE.CREDENTIALS, displayValue: 'Credentials' }
  ]);
  const renderAuthTypes = (authTypes) => authTypes.map(t =>
        <option key={t.value} value={t.value}>{t.displayValue}</option>);
  return (
    <div className="auth-type-form">
      <label htmlFor="auth-type">Auth Type: </label>
      <FormSelect id="auth-type" onChange={(e) => onAuthTypeChanged(e.target.value)}>
        {renderAuthTypes(authTypes)}
      </FormSelect>
    </div>
  );
}

export function EnvironmentForm({ onEnvChange }) {
  const [ENV] = useState({ DEMO: 'DEMO', PROD: 'PROD' });

  return (
    <div className="env-form">
      <label htmlFor="env-type">Environment: </label>
      {process.env.REACT_APP_PRE_TRADE_WEBSOCKET_URL && process.env.REACT_APP_TRADE_WEBSOCKET_URL ? <div>Custom</div> :
      <FormSelect id="env-type" onChange={(e) => onEnvChange(e.target.value)}>
        <option value={ENV.DEMO}>Demo</option>
        <option value={ENV.PROD}>Production</option>
      </FormSelect>
      }
    </div>
  );
}

export function LoginButtons({ onClick, isLoggedIn = false }) {
  return (
    <div>
      <Container>
        <Row>
          <Col>
            <Button className="login-button" theme="secondary" onClick={() => onClick()}>Login</Button>
          </Col>
          <Col>
            {!isLoggedIn &&
            <OAuthButton
              oauthProviderUrl={`${process.env.REACT_APP_OAUTH2_URL}/authorize`}
              redirectUri={process.env.REACT_APP_OAUTH2_REDIRECT}
            />
            }
          </Col>
        </Row>
      </Container>
    </div>
  )
}
