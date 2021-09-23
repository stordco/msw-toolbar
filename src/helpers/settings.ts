import { WorkerMode, WorkerStatus } from '../types';

export const modes: WorkerMode[] = ['normal', 'error'];

const buildKey = (prefix: string, key: string) =>
  `${prefix && `${prefix}_`}msw_toolbar_${key}`;

type AllowedValueForSetting<Setting> = Setting extends 'mode'
  ? WorkerMode
  : Setting extends 'status'
  ? WorkerStatus
  : Setting extends 'delay'
  ? string
  : never;

export const get = <Setting extends string>(
  prefix: string,
  key: Setting,
  defaultValue?: AllowedValueForSetting<Setting>
) => {
  const value = localStorage.getItem(buildKey(prefix, key)) ?? defaultValue;
  return value as NonNullable<typeof defaultValue>;
};

export const set = <Setting extends string>(
  prefix: string,
  key: Setting,
  value: AllowedValueForSetting<Setting>
) => {
  localStorage.setItem(buildKey(prefix, key), value);
};
