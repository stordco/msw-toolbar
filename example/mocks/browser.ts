import { rest, setupWorker } from 'msw';

export const getWorker = () => {
  return setupWorker(
    ...[
      rest.get('http://www.example.com', (_req, res, ctx) => {
        return res(ctx.json({ okay: 'there' }));
      }),
    ]
  );
};
