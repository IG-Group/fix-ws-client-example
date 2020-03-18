import React, { useState, useEffect } from 'react';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink, Container } from 'shards-react';
import { BrowserRouter as Router, Link, Switch, Route} from 'react-router-dom';
import WebsocketConnection, {WEBSOCKET_SOURCE} from './services/websocket-connection';
import OAuthService from './services/auth-service';
import Login from './component/pages/login';
import Trade from './component/pages/trade';
import Websocket from './services/websocket';
import AuthenticatedRoute from './component/route/authenticated-route';
import RedirectRoute from './component/route/redirect-route';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

const { REACT_APP_TRADE_WEBSOCKET_URL, REACT_APP_PRE_TRADE_WEBSOCKET_URL  } = process.env;

export default function App() {
  const [ isPreTradeConnected, setIsPreTradeConnected ] = useState(false);
  const [ isTradeConnected, setIsTradeConnected ] = useState(false);
  const [ isPreTradeEstablish, setIsPreTradeEstablish ] = useState(false);
  const [ isTradeEstablish, setIsTradeEstablish ] = useState(false);

  const [ isPreTradeLoginSuccessful, setIsPreTradeLoginSuccessful ] = useState(false);
  const [ isTradeLoginSuccessful, setIsTradeLoginSuccessful ] = useState(false);

  const [ preTradeAttempts, setPreTradeAttempts ] = useState(0);
  const [ tradeAttempts, setTradeAttempts ] = useState(0);

  const [ authService, setAuthService ] = useState(null);
  const [ preTradeService, setPreTradeService ] = useState(null);
  const [ tradeService, setTradeService ] = useState(null);
  const [ historicCandleData, setHistoricCandleData ] = useState([]);
  const [ chartSubscriptionData, setChartSubscriptionData ] = useState({});
  const [ loginMessage, setLoginMessage ] = useState({});
  const [ quoteMessage, setQuoteMessage ] = useState({});
  const [ securityListMessage, setSecurityListMessage ] = useState(null);
  const [ tradeMessage, setTradeMessage ] = useState({});

  useEffect(() => {
    const { REACT_APP_PRE_TRADE_WEBSOCKET_URL, REACT_APP_TRADE_WEBSOCKET_URL  } = process.env;
    setAuthService(new OAuthService());

    setPreTradeService(new WebsocketConnection(REACT_APP_PRE_TRADE_WEBSOCKET_URL));
    setTradeService(new WebsocketConnection(REACT_APP_TRADE_WEBSOCKET_URL));
  }, []);

  function resetPreTradeState() {
    setPreTradeAttempts(preTradeAttempts + 1);

    if (preTradeAttempts + 1 !== 3) {
      resetState(preTradeService, setPreTradeService, REACT_APP_PRE_TRADE_WEBSOCKET_URL,setIsPreTradeEstablish);
      resetMessages();
      setIsPreTradeLoginSuccessful(false);
    }
  }

  function resetTradeState() {
    setTradeAttempts(tradeAttempts + 1);

    if (tradeAttempts + 1 !== 3) {
      resetState(tradeService, setTradeService, REACT_APP_TRADE_WEBSOCKET_URL, setIsTradeEstablish);
      setTradeMessage({});
      setIsTradeLoginSuccessful(false);
    }
  }

  function resetState(service, serviceSetter, websocketUrl, establishSetter) {
    if (service) {
      service.stopHeartbeat();
    }
    const timer = setTimeout(() => {
      serviceSetter(new WebsocketConnection(websocketUrl));
      clearTimeout(timer);
    }, 5000);
    establishSetter(false);
  }

  function resetMessages() {
    setQuoteMessage(null);
    setHistoricCandleData([]);
    setChartSubscriptionData({});
    setSecurityListMessage(null);
  }

  function handleLoginSuccessful(serviceType) {
    setLoginMessage({});
    if (serviceType === WEBSOCKET_SOURCE.PRE_TRADE) {
      setIsPreTradeEstablish(true);
      setIsPreTradeLoginSuccessful(true);
    } else if (serviceType === WEBSOCKET_SOURCE.TRADE) {
      setIsTradeEstablish(true);
      setIsTradeLoginSuccessful(true);
    }
  }

  function setMessageSource(message, source) {
    message.Source = source;
  }

  function handlePreTradeMessages(message) {
    const { MessageType, MsgType } = message;
    if (MessageType) {
      if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck" || MessageType === "NegotiationReject") {
        setMessageSource(message, WEBSOCKET_SOURCE.PRE_TRADE);
        setLoginMessage(message);
      }
    } else if (MsgType) {
      switch(MsgType) {
        case "Quote":
          setQuoteMessage(message);
          break;
        case "HistoricCandleResponse":
          setHistoricCandleData(message.CandleData);
          break;
        case "ChartDataSubscriptionResponse":
          setChartSubscriptionData(message);
          break;
        case "SecurityList":
          setSecurityListMessage(message.SecListGrp);
          break;
        default:
          console.log(message);
      }
    }
  }

  function handleTradeMessages(message) {
    const { MessageType, MsgType } = message;
    if (MessageType) {
      if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck") {
        setMessageSource(message, WEBSOCKET_SOURCE.TRADE);
        setLoginMessage(message);
      }
    } else if (MsgType) {
        switch(MsgType) {
          case "ExecutionReport":
              setTradeMessage(message);
            break;
          default:
            console.log(message);
        }
    }
  }

  return (
    <div>
      <Websocket
        onMessage={handlePreTradeMessages}
        onOpen={() => {setPreTradeAttempts(0); setIsPreTradeConnected(true)}}
        onError={() => resetMessages()}
        onClose={() => resetPreTradeState()}
        service={preTradeService}
      />
      <Websocket
          onMessage={handleTradeMessages}
          onOpen={() => {setTradeAttempts(0); setIsTradeConnected(true)}}
          onError={() => setTradeMessage({})}
          onClose={() => resetTradeState()}
          service={tradeService}
      />
      <Router>
        <div className="App">
          <Navbar type="dark" theme="danger" expand="md">
            <NavbarBrand href="#">Example Client</NavbarBrand>
            <Nav navbar>
              {!isPreTradeLoginSuccessful && !isTradeLoginSuccessful ? (
              <NavItem>
                <Link className="nav-link active" to="/login">Login</Link>
              </NavItem>) : (
                <div style={{'display': 'inherit'}}>
                  <NavItem>
                    <Link className="nav-link active" to="/trade">Trade</Link>
                  </NavItem>
                </div>
              )}
            </Nav>
            <Nav navbar className="ml-auto">
              <NavItem>
                {tradeAttempts > 0 || preTradeAttempts > 0 ?
                  <NavLink active>
                    {tradeAttempts === 3 || preTradeAttempts === 3 ? "Please try again later." : "Failed to connect, retrying..."}
                  </NavLink> :
                  <NavLink active>
                    Status: {isPreTradeConnected && isTradeConnected ?  'Connected': 'Closed'}
                  </NavLink>
                }
              </NavItem>
            </Nav>
          </Navbar>
        </div>
        <Container>
          <div className="router-view">
            <Switch>
              <RedirectRoute condition={isPreTradeEstablish && isTradeEstablish} path="/" exact />
              <Route path="/login">
                <Login
                  preTradeService={preTradeService}
                  tradeService={tradeService}
                  authService={authService}
                  message={loginMessage}
                  isConnected={isPreTradeConnected && isTradeConnected}
                  isLoginSuccessful={isPreTradeLoginSuccessful && isTradeLoginSuccessful}
                  onLoginSuccessful={handleLoginSuccessful}
                />
              </Route>
              <AuthenticatedRoute condition={isPreTradeEstablish && isTradeEstablish} path="/trade">
                <Trade
                  isEstablish={isPreTradeEstablish && isTradeEstablish}
                  quoteMessage={quoteMessage}
                  tradeMessage={tradeMessage}
                  preTradeService={preTradeService}
                  tradeService={tradeService}
                  candleData={historicCandleData}
                  candleSubscriptionData={chartSubscriptionData}
                  securityList={securityListMessage}
                />
              </AuthenticatedRoute>
            </Switch>
          </div>
        </Container>
      </Router>
    </div>
  );
}
