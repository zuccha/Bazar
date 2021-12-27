import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CoreContextProvider } from './contexts/CoreContext';
import { NavigationContextProvider } from './contexts/NavigationContext';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <NavigationContextProvider>
        <CoreContextProvider>
          <App />
        </CoreContextProvider>
      </NavigationContextProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
