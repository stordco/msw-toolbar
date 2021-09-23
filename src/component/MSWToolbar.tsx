import * as React from 'react';
import { rest } from 'msw';
import {
  SetupWorkerApi,
  MockedRequest,
  ResponseComposition,
  RestContext,
} from 'msw';
import { usePrevious } from './hooks';
import styles from './styles.module.css';
import { WorkerMode } from '../types';
import { get, modes, set } from '../helpers';

interface Props {
  /**
   * A prefix will be prepended to the localStorage key we use for persisting settings. If you use this component
   * on many applications locally, you'll want to set this so configuration from app A doesn't impact app B.
   */
  prefix?: string;
  /**
   * The base url of your requests. This is required to use 'error' mode as it takes the base domain and intercepts any request regardless of the path.
   */
  apiUrl: string;
  /**
   * Actions can be useful for adding custom buttons/behaviors that might go along with MSW. If you're caching requests with RTK Query or react-query,
   * it would be useful to add an 'Invalidate Cache' button here.
   */
  actions?: React.ReactElement;
  /**
   * If the worker is not enabled, we won't ever load it and will just load children.
   */
  isEnabled?: boolean;
  /**
   * An instance of the MSW worker returned from `setupWorker`.
   */
  worker: SetupWorkerApi | undefined;
  /**
   * This component takes children so that it can ensure the worker has started before rendering the tree. This guarantees that
   * all requests will be intercepted.
   */
  children?: React.ReactNode;
}

/**
 * This is a simple toolbar that allows you to toggle MSW handlers in local development as well as easily invalidate all of the caches.
 *
 * Modes:
 *  - 'error' = will throw a Network Error on any request to our internal API
 *  - 'normal' = handlers behave as originally defined
 * Delay: Allows you to set a global delay for all requests
 */
export const MSWToolbar = ({
  children = <div />,
  isEnabled = false,
  apiUrl = '',
  actions,
  worker,
  prefix = '',
}: Props) => {
  if ((isEnabled && !worker) || (isEnabled && worker && !worker.start)) {
    console.warn(
      'Unable to load MSWToolbar due to the worker being undefined. Please pass in a worker instance from setupWorker(...handlers).'
    );
  }

  const workerRef = React.useRef<SetupWorkerApi>();

  const [isReady, setIsReady] = React.useState(isEnabled ? false : true);

  const [mode, setMode] = React.useState<WorkerMode>(
    get(prefix, 'mode', 'normal')
  );

  const lastWorkerStateFromStorage = get(prefix, 'status', 'disabled');

  const [workerEnabled, setWorkerEnabled] = React.useState(
    lastWorkerStateFromStorage === 'enabled'
  );

  const previousWorkerEnabled = usePrevious(workerEnabled);
  const hasChangedWorkerState =
    previousWorkerEnabled !== undefined &&
    workerEnabled !== previousWorkerEnabled;

  const [delay, setDelay] = React.useState(get(prefix, 'delay', '75'));

  React.useEffect(() => {
    if (!worker || !isEnabled || workerRef.current) return;

    const prepareWorker = async () => {
      if (workerEnabled) {
        worker.start();
      }
      workerRef.current = worker;
      setIsReady(true);
    };

    prepareWorker();
  }, [workerEnabled, isEnabled, worker]);

  React.useEffect(() => {
    if (workerRef.current && hasChangedWorkerState) {
      const action = workerEnabled ? 'start' : 'stop';

      workerRef.current[action]();

      set(prefix, 'status', workerEnabled ? 'enabled' : 'disabled');
    }
  }, [workerEnabled, hasChangedWorkerState, prefix]);

  React.useEffect(() => {
    set(prefix, 'mode', mode);

    switch (mode) {
      case 'normal':
        workerRef.current?.resetHandlers();
        return;
      case 'error':
        workerRef.current?.use(
          ...['get', 'post', 'put', 'patch', 'delete'].map(method =>
            (rest as any)[method as any](
              `${apiUrl}/*`,
              (
                _req: MockedRequest<any>,
                res: ResponseComposition<any>,
                _ctx: RestContext
              ) => {
                return res.networkError('Fake error');
              }
            )
          )
        );
        return;
      default:
        return;
    }
  }, [mode, isReady, apiUrl, prefix]);

  React.useEffect(() => {
    set(prefix, 'delay', String(delay));
  }, [delay, prefix]);

  if (!isEnabled || !worker) return <>{children}</>;

  return isReady ? (
    <>
      <>
        <div className={styles.container}>
          <div className={styles['left-actions']}>
            <div className={styles['input-wrapper']}>
              <label>Mocks:</label>

              <div className={styles.onoffswitch}>
                <input
                  type="checkbox"
                  name="onoffswitch"
                  className={styles['onoffswitch-checkbox']}
                  id="myonoffswitch"
                  tabIndex={0}
                  onChange={() => setWorkerEnabled(prev => !prev)}
                  checked={workerEnabled}
                />
                <label
                  className={styles['onoffswitch-label']}
                  htmlFor="myonoffswitch"
                ></label>
              </div>
            </div>
            <div className={styles['input-wrapper']}>
              <label htmlFor="mode">Mode:</label>
              <select
                id="mode"
                value={mode}
                onChange={({ target: { value } }) =>
                  setMode(value as WorkerMode)
                }
                style={{ width: 150, backgroundColor: 'white' }}
              >
                {modes.map(m => (
                  <option value={m} key={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['input-wrapper']}>
              <label htmlFor="delay">Delay (ms):</label>
              <input
                id="delay"
                type="number"
                onChange={event => setDelay(event.target.value)}
                value={delay}
              />
            </div>
          </div>

          <div className={styles.spacer} />
          {actions ? actions : null}
        </div>
      </>
      {children}
    </>
  ) : null;
};
