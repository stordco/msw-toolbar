import { rest, setupWorker } from 'msw';
import { utils } from '../../';

export const getWorker = () => {
  return setupWorker(
    ...[
      rest.get('http://www.example.com', (_req, res, ctx) => {
        return utils.json(res, ctx, { okay: 'there' });
      }),
    ]
  );
};
