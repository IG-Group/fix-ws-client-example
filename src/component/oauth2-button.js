import React from 'react';
import {Button} from 'shards-react';

export default function OAuth2Redirect({ oauthProviderUrl, redirectUri }) {
  function redirectToOAuth() {
    const qParams = [
      `redirect_uri=${redirectUri}`
    ].join('&');
    window.location.assign(`${oauthProviderUrl}?${qParams}`);
   }
  return (
    <div className="oauth2-redirect">
      <Button theme="primary" onClick={redirectToOAuth}>Login with IG</Button>
    </div>
  );
}
