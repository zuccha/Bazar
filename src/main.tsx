import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import { CoreContextProvider } from './contexts/CoreContext';
import store from './store';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <CoreContextProvider>
          <App />
        </CoreContextProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
