import { ReactElement } from 'react';
import {
  usePatchDirectoryPath,
  usePatchInfo,
  useRenameSetPatchInfo,
} from '../../../../../../core-hooks/Patch';
import Patch from '../../../../../../core/Patch';
import PatchInfoForm from '../../../../../forms/PatchInfoForm';

interface PatchesTabInfoProps {
  patch?: Patch;
}

const PatchesTabInfoWithPatch = ({
  patch,
}: Required<PatchesTabInfoProps>): ReactElement => {
  const directoryPath = usePatchDirectoryPath(patch);
  const patchInfo = usePatchInfo(patch);
  const updatePatchInfo = useRenameSetPatchInfo(patch);

  return (
    <PatchInfoForm
      directoryPath={directoryPath}
      isSuccinct
      onSubmit={updatePatchInfo}
      info={patchInfo}
    />
  );
};

const PatchesTabInfoWithoutPatch = (): ReactElement => {
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

export default function PatchesTabInfo({
  patch,
}: PatchesTabInfoProps): ReactElement {
  return patch ? (
    <PatchesTabInfoWithPatch patch={patch} />
  ) : (
    <PatchesTabInfoWithoutPatch />
  );
}
