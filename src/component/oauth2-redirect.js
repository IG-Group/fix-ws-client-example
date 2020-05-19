import React from 'react';
import {Button} from 'shards-react';

export default function OAuth2Redirect({ clientId, oauthProviderUrl, redirectUri, state, scope }) {
  function redirectToOAuth() {
      const qParams = [
         'response_type=code',
         'realm=external'
         `client_id=${clientId}`,
         `redirect_uri=${redirectUri}`,
         `scope=${scope}`,
         `state=${state}`,
      ].join("&");

      window.location.assign(`${oauthProviderUrl}/${qParams}`);
   }
  return (
    <div className="oauth2-redirect">
      <Button theme="primary" onClick={redirectToOAuth}>Login with IG</Button>
    </div>
  );
}
