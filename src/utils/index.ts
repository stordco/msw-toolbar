import { HttpResponse, delay } from 'msw'
import { get } from '../helpers';

/**
 * Creates a collection of utils that are scoped to a given application prefix
 */
export const createUtils = (prefix: string = '') => {
  /**
   * A small helper that returns ctx.delay with the value from the toolbar
   */
  function getDelay() {
    return delay(Number(get(prefix, 'delay', '0')));
  }

  return {
    getDelay,
    /**
     * A small helper that returns the given data with the delay from the toolbar
     */
    async json(data?: any) {
      await getDelay()
      return HttpResponse.json(data);
    },
    /**
     * Returns a 404 with the delay from the toolbar
     */
    async notFound() {
      await getDelay()
      return new HttpResponse(null, { status: 404 });
    },
  };
};

export * from '../helpers/settings';
