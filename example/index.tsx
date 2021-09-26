import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MSWToolbar } from '../.';
import { Button, ChakraProvider, HStack } from '@chakra-ui/react';
import type { SetupWorkerApi } from 'msw';
import { APP_NAME } from './constants';

const isDev = process.env.NODE_ENV === 'development';

let worker: SetupWorkerApi;

// An example of deferring app mounting until the worker has been loaded in development only
const prepareWorker = async () => {
  if (isDev) {
    const { getWorker } = await import('./mocks/browser');
    worker = getWorker();
    return worker;
  }
};

const App = () => {
  return (
    <div>
      <ChakraProvider>
        <MSWToolbar
          worker={worker}
          apiUrl="https://pokeapi.co"
          isEnabled={true}
          actions={
            <HStack spacing={2}>
              <Button onClick={() => alert('Hooray')}>Custom Action</Button>
              <Button onClick={() => alert('Yadiddit')}>Another</Button>
            </HStack>
          }
          prefix={APP_NAME}
        >
          <Button
            onClick={() => {
              fetch('https://pokeapi.co/api/v2/pokemon/ditto').then(
                async (res) => {
                  if (res.ok) {
                    const content = await res.json();
                    alert(
                      `Here is the mocked response!: ${JSON.stringify(content)}`
                    );
                  }
                }
              );
            }}
            mt={50}
          >
            Make a request
          </Button>
        </MSWToolbar>
      </ChakraProvider>
    </div>
  );
};

function renderApp() {
  return ReactDOM.render(<App />, document.getElementById('root'));
}

prepareWorker().then(() => renderApp());
