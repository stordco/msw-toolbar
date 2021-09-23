import { ResponseComposition, RestContext } from 'msw';
import { get } from '../helpers';

/**
 * Creates a collection of utils that are scoped to a given application prefix
 */
export const createUtils = (prefix: string = '') => {
  /**
   * A small helper that returns ctx.delay with the value from the toolbar
   */
  function getDelay(ctx: RestContext) {
    return ctx.delay(Number(get(prefix, 'delay', '0')));
  }

  return {
    getDelay,
    /**
     * A small helper that returns the given data with the delay from the toolbar
     */
    json(res: ResponseComposition<any>, ctx: RestContext, data?: any) {
      return res(ctx.json(data), getDelay(ctx));
    },
    /**
     * Returns a 404 with the delay from the toolbar
     */
    notFound(res: ResponseComposition<any>, ctx: RestContext) {
      return res(ctx.status(404), getDelay(ctx));
    },
  };
};

export * from '../helpers/settings';
