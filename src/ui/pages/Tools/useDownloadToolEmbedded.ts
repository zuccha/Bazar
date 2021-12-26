import { useDispatch, useSelector } from 'react-redux';
import { Toolchain } from '../../../core/Toolchain';
import useAsyncCallback from '../../../hooks/useAsyncCallback';
import useHandleError from '../../../hooks/useHandleError';
import { AppDispatch, AppState } from '../../../store';
import { getToolchain } from '../../../store/slices/core/slices/toolchain';
import { ErrorReport } from '../../../utils/ErrorReport';

export default function useDownloadToolEmbedded({
  name,
  key,
  download,
}: {
  name: string;
  key: keyof Toolchain['embedded'];
  download: () => (
    dispatch: AppDispatch,
    getState: () => AppState,
  ) => Promise<ErrorReport | undefined>;
}): [() => void, 'downloading' | 'installed' | 'not-installed' | 'deprecated'] {
  const handleError = useHandleError();
  const dispatch = useDispatch<AppDispatch>();
  const toolchain = useSelector(getToolchain());

  const handleDownload = useAsyncCallback(async () => {
    const error = await dispatch(download());
    handleError(error, `Failed to download  ${name}`);
    return error;
  }, [dispatch, handleError, name, download]);

  const status = handleDownload.isLoading
    ? 'downloading'
    : toolchain.embedded[key].status;

  return [handleDownload.call, status];
}
