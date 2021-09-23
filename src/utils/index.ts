import { ResponseComposition, RestContext } from 'msw';

export const getDelay = (ctx: RestContext) =>
  ctx.delay(Number(localStorage?.getItem('mswDelay') || 0));

export const json = (
  res: ResponseComposition<any>,
  ctx: RestContext,
  data?: any
) => {
  return res(ctx.json(data), getDelay(ctx));
};

export const notFound = (res: ResponseComposition<any>, ctx: RestContext) => {
  return res(ctx.status(404), getDelay(ctx));
};
