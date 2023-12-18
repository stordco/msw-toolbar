import * as React from 'react';
import {http, HttpResponse} from 'msw';
import {SetupWorker} from 'msw/browser';
import {usePrevious} from './hooks';
import styles from './styles.module.css';
import {WorkerMode} from '../types';
import {get, modes, set} from '../helpers';
import {MSWToolbarProps} from '..';

import MSWLogo from './msw-logo.svg';

/**
 * This is a simple toolbar that allows you to toggle MSW handlers in local development as well as easily invalidate all of the caches.
 *
 * Modes:
 *  - 'error' = will throw a Network Error on any request to our internal API
 *  - 'normal' = handlers behave as originally defined
 * Delay: Allows you to set a global delay for all requests
 */
export const MSWToolbar = ({
  children = <div/>,
  isEnabled = false,
  apiUrl = '',
  actions,
  worker,
  prefix = '',
  className,
  position = 'top',
  ...props
  }: MSWToolbarProps) => {
  if ((isEnabled && !worker) || (isEnabled && worker && !worker.start)) {
    console.warn(
      'Unable to load MSWToolbar due to the worker being undefined. Please pass in a worker instance from setupWorker(...handlers).'
    );
  }

  const workerRef = React.useRef<SetupWorker>();

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
        workerRef.current?.use(http.all(`${apiUrl}/*`, () => {
          return HttpResponse.error();
        }));
        return;
      default:
        return;
    }
  }, [mode, isReady, apiUrl, prefix]);

  React.useEffect(() => {
    set(prefix, 'delay', String(delay));
  }, [delay, prefix]);

  const [isHidden, setIsHidden] = React.useState(
    () => get(prefix, 'isHidden', 'true') === 'true'
  );

  if (!isEnabled || !worker) return <>{children}</>;

  if (!isReady) {
    return null;
  }

  return (
    <>
      <button
        className={`${styles.btn} ${styles['show-toolbar-button']}`}
        onClick={() => {
          setIsHidden(false);
          set(prefix, 'isHidden', 'false');
        }}
        hidden={!isHidden}
      >
        <MSWLogo width={64}/>
      </button>

      <div
        className={[className, styles['msw-toolbar']].filter(Boolean).join(' ')}
        data-hidden={isHidden}
        data-position={position}
        {...props}
      >
        <div>
          <button
            className={`${styles.btn} ${styles['close-button']}`}
            onClick={() => {
              setIsHidden(true);
              set(prefix, 'isHidden', 'true');
            }}
          >
            Close
          </button>

          <div className={styles.controls}>
            <label
              className={`${styles.toggle} ${styles['input-wrapper']}`}
              htmlFor="msw-toolbar-mocks-toggle"
            >
              <span className={styles.label}>Mocks:</span>

              <div data-toggle-checkbox-container>
                <input
                  id="msw-toolbar-mocks-toggle"
                  type="checkbox"
                  tabIndex={0}
                  onChange={() => setWorkerEnabled(prev => !prev)}
                  checked={workerEnabled}
                />
                <div data-toggle-track/>
                <div data-toggle-handle/>
              </div>
            </label>

            <div className={styles['input-wrapper']}>
              <label className={styles.label} htmlFor="msw-toolbar-mode">
                Mode:
              </label>

              <select
                id="msw-toolbar-mode"
                value={mode}
                onChange={event => setMode(event.target.value as WorkerMode)}
              >
                {modes.map(m => (
                  <option value={m} key={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles['input-wrapper']}>
              <label className={styles.label} htmlFor="msw-toolbar-delay">
                Delay (ms):
              </label>

              <input
                id="msw-toolbar-delay"
                type="number"
                onChange={event => setDelay(event.target.value)}
                value={delay}
              />
            </div>
          </div>
        </div>

        <div className={styles.spacer}/>

        {actions ? <div>{actions}</div> : null}
      </div>

      {children}
    </>
  );
};
