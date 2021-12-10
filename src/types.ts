import { SetupWorkerApi } from 'msw';
import React from 'react';

export interface MSWToolbarProps extends React.ComponentPropsWithoutRef<'div'> {
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

  /**
   * The position of the toolbar.
   * @default 'top'
   */
  position?: 'top' | 'bottom';
}

export type Setting = 'mode' | 'delay' | 'status' | 'isHidden';
export type WorkerStatus = 'enabled' | 'disabled';
export type WorkerMode = 'normal' | 'error';
