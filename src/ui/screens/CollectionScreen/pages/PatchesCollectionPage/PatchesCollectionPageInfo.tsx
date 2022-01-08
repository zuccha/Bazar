import { ReactElement } from 'react';
import { useEditPatchInCollection } from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import {
  usePatchDirectoryPath,
  usePatchInfo,
} from '../../../../../core-hooks/Patch';
import Patch from '../../../../../core/Patch';
import PatchInfoForm from '../../../../forms/PatchInfoForm';

interface PatchesCollectionPageInfoProps {
  patch: Patch;
}

export default function PatchesCollectionPageInfo({
  patch,
}: PatchesCollectionPageInfoProps): ReactElement {
  const collection = useCollection();
  const directoryPath = usePatchDirectoryPath(patch);
  const patchInfo = usePatchInfo(patch);
  const editPatchInfo = useEditPatchInCollection(collection);

  return (
    <PatchInfoForm
      directoryPath={directoryPath}
      isSuccinct
      onSubmit={(info) => editPatchInfo(patch.getInfo().name, info)}
      info={patchInfo}
    />
  );
}
