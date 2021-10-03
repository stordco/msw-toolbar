import * as React from 'react';
import { rest } from 'msw';
import { SetupWorkerApi } from 'msw';
import { usePrevious } from './hooks';
import styles from './styles.module.css';
import { WorkerMode } from '../types';
import { buildHandlersForTrackedRequests, get, modes, set } from '../helpers';
import { MSWToolbarProps, TrackedRequest } from '..';

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
}: MSWToolbarProps) => {
  if ((isEnabled && !worker) || (isEnabled && worker && !worker.start)) {
    console.warn(
      'Unable to load MSWToolbar due to the worker being undefined. Please pass in a worker instance from setupWorker(...handlers).'
    );
  }

  const workerRef = React.useRef<SetupWorkerApi>();
  const trackedRequestsRef = React.useRef<TrackedRequest>(new Map());

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
      case 'record':
        // Passing empty handlers will cause everything to run as a bypass
        workerRef.current?.use(...[]);
        workerRef.current?.events.on('request:start', request => {
          trackedRequestsRef.current.set(request.id, {
            time: Number(new Date()),
            request,
            response: null,
          });
        });

        workerRef.current?.events.on('response:bypass', async (res, reqId) => {
          const existingRequestEntry = trackedRequestsRef.current.get(reqId);
          if (existingRequestEntry) {
            trackedRequestsRef.current.set(reqId, {
              ...existingRequestEntry,
              time: existingRequestEntry.time - Number(new Date()),
              response: res.clone(),
            });
          }
        });

        return;
      case 'replay':
        workerRef.current?.events.removeAllListeners();
        buildHandlersForTrackedRequests(trackedRequestsRef.current).then(
          handlers => {
            workerRef.current?.resetHandlers(...handlers);
          }
        );

        return;
      case 'normal':
        workerRef.current?.events.removeAllListeners();
        workerRef.current?.resetHandlers();
        return;
      case 'error':
        workerRef.current?.use(
          ...(['get', 'post', 'put', 'patch', 'delete'] as Array<
            keyof typeof rest
          >).map(method =>
            rest[method](`${apiUrl}/*`, (_req, res, _ctx) => {
              return res.networkError('Fake error');
            })
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
