import { rest, setupWorker } from 'msw';
import { createUtils } from '../../';
import { APP_NAME } from '../constants';

const { json } = createUtils(APP_NAME);

export const getWorker = () => {
  return setupWorker(
    ...[
      rest.get('http://www.example.com', (_req, res, ctx) => {
        return json(res, ctx, { okay: 'there' });
      }),
    ]
  );
};
