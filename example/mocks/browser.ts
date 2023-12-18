import { setupWorker } from 'msw/browser';
import {http, HttpResponse} from 'msw';
import { createUtils } from '../../';
import { APP_NAME } from '../constants';

const { json } = createUtils(APP_NAME);

export const getWorker = () => {
  return setupWorker(
    ...[
      http.get('http://www.example.com', () => HttpResponse.json({ okay: 'there' })),
    ]
  );
};
