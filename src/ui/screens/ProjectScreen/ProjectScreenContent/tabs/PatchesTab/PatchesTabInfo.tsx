import { ReactElement } from 'react';
import {
  usePatchDirectoryPath,
  usePatchInfo,
} from '../../../../../../core-hooks/Patch';
import Patch, { PatchInfo } from '../../../../../../core/Patch';
import ErrorReport from '../../../../../../utils/ErrorReport';
import PatchInfoForm from '../../../../../forms/PatchInfoForm';

interface PatchesTabInfoWithPatchProps {
  patch: Patch;
  onEditInfo: (info: PatchInfo) => Promise<ErrorReport | undefined>;
}

export const PatchesTabInfoWithPatch = ({
  patch,
  onEditInfo,
}: PatchesTabInfoWithPatchProps): ReactElement => {
  const directoryPath = usePatchDirectoryPath(patch);
  const patchInfo = usePatchInfo(patch);

  return (
    <PatchInfoForm
      directoryPath={directoryPath}
      isSuccinct
      onSubmit={onEditInfo}
      info={patchInfo}
    />
  );
};

export const PatchesTabInfoWithoutPatch = (): ReactElement => {
  return (
    <PatchInfoForm
      directoryPath=''
      isSuccinct
      isTurnedOff
      onSubmit={async () => undefined}
      info={Patch.InfoEmpty}
    />
  );
};
