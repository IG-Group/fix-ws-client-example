## FIX API over Websocket Example Frontend Client 

### Setting Environment

#### OAuth2 Service
Please see [vendor example](https://github.com/IG-Group/ig-oauth-api-example)
for an example OAuth2 service that this example will use for authentication.

Define these variables in an `.env` file
```
# IG OAUTH 
# This should be your server endpoint that makes request to IG's OAuth2 Service
REACT_APP_OAUTH2_URL=[OAUTH2 URL]

# IG FIX WEBSOCKET
REACT_APP_PRE_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]
REACT_APP_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]
REACT_APP_CLIENT_HEARTBEAT=30000
```

### Running Application
Install [NPM (Node Package Manager)](https://nodejs.org/en/)

Make sure its installed successfully:

```
npm --version
node --version
```

Install dependencies and start the app

```
npm install
npm start
```

The app should open in the browser at:

```
http://localhost:3000
```
