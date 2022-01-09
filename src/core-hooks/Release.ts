import Release, { ReleaseInfo } from '../core/Release';
import { useGet, useSetAsync } from '../hooks/useAccessors';
import ErrorReport from '../utils/ErrorReport';

export const useReleaseInfo = (release: Release): ReleaseInfo => {
  return useGet(release, release.getInfo);
};

export const useSetReleaseInfo = (
  release: Release,
): ((info: ReleaseInfo) => Promise<ErrorReport | undefined>) => {
  return useSetAsync(release, release.setInfo);
};
