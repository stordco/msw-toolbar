import { Setting } from '..';
import { WorkerMode, WorkerStatus } from '../types';

export const modes: WorkerMode[] = ['normal', 'error'];

type SettingValueMap = {
  mode: WorkerMode;
  status: WorkerStatus;
  delay: string;
};

type AllowedValueForSetting<Setting> = SettingValueMap[Setting &
  keyof SettingValueMap];

const buildKey = (prefix: string, key: string) =>
  `${prefix && `${prefix}_`}msw_toolbar_${key}`;

export const get = <S extends Setting>(
  prefix: string,
  key: S,
  defaultValue: AllowedValueForSetting<S>
) => {
  const value = localStorage.getItem(buildKey(prefix, key)) ?? defaultValue;
  return value as NonNullable<typeof defaultValue>;
};

export const set = <S extends Setting>(
  prefix: string,
  key: S,
  value: AllowedValueForSetting<S>
) => {
  localStorage.setItem(buildKey(prefix, key), value);
};
