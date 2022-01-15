import { ReactElement, useCallback, useMemo } from 'react';
import { useAddPatchToCollectionFromExisting } from '../../../../../../core-hooks/Collection';
import { useCollection, useToolchain } from '../../../../../../core-hooks/Core';
import {
  useAddPatchToProjectSnapshotFromDirectory,
  useAddPatchToProjectSnapshotFromFile,
  useAddPatchToProjectSnapshotFromTemplate,
  useEditPatchInProjectSnapshot,
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../../core-hooks/ProjectSnapshot';
import { useGetEmbeddedTool } from '../../../../../../core-hooks/Toolchain';
import Patch from '../../../../../../core/Patch';
import ProjectSnapshot from '../../../../../../core/ProjectSnapshot';
import { useList } from '../../../../../../hooks/useAccessors';
import useToast from '../../../../../../hooks/useToast';
import { TableColumn, TableRow } from '../../../../../../ui-atoms/Table';
import { EitherErrorOr } from '../../../../../../utils/EitherErrorOr';
import { Process } from '../../../../../../utils/Shell';
import PatchAdditionFromFilesDrawer from '../../../../../drawers/PatchAdditionFromFilesDrawer';
import PatchAdditionFromTemplateDrawer from '../../../../../drawers/PatchAdditionFromTemplateDrawer';
import PatchTemplateAdditionDrawer from '../../../../../drawers/PatchTemplateAdditionDrawer';
import ResourcesTab from '../../ResourcesTab';
import {
  PatchesTabInfoWithoutPatch,
  PatchesTabInfoWithPatch,
} from './PatchesTabInfo';

interface PatchesTabProps {
  projectSnapshot: ProjectSnapshot;
}

export default function PatchesTab({
  projectSnapshot,
}: PatchesTabProps): ReactElement {
  const toast = useToast();

  const collection = useCollection();
  const toolchain = useToolchain();
  const asar = useGetEmbeddedTool(toolchain, 'asar');

  const patches = useProjectSnapshotPatches(projectSnapshot);
  const addPatchFromFile =
    useAddPatchToProjectSnapshotFromFile(projectSnapshot);
  const addPatchFromDirectory =
    useAddPatchToProjectSnapshotFromDirectory(projectSnapshot);
  const addPatchFromTemplate =
    useAddPatchToProjectSnapshotFromTemplate(projectSnapshot);
  const editPatch = useEditPatchInProjectSnapshot(projectSnapshot);

  const handleApplyPatches = useCallback(
    async (patches: Patch[]): Promise<EitherErrorOr<Process[]>> => {
      return toolchain.applyPatches(
        await projectSnapshot.getRomFilePath(),
        patches,
      );
    },
    [toolchain.applyPatches],
  );

  const handleRemovePatch = useRemovePatchFromProjectSnapshot(projectSnapshot);

  const saveAsTemplate = useAddPatchToCollectionFromExisting(collection);

  const columns: TableColumn<Patch>[] = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Name',
        getValue: (row) => row.data.getInfo().name,
        width: 'fill',
      },
    ];
  }, []);

  const rows: TableRow<Patch>[] = useList(patches).map((patch) => ({
    data: patch,
    key: patch.getInfo().name,
  }));

  return (
    <ResourcesTab
      name='patch'
      resources={patches}
      canApply={asar.status === 'installed'}
      canOpenInEditor={false}
      canRemove
      canSaveAsTemplate
      onApply={handleApplyPatches}
      onOpenInEditor={() => Promise.resolve(undefined)}
      onRemove={handleRemovePatch}
      removeConfirmationMessage="Are you sure you want to remove this patch? If the patch has already been applied, removing it from the list won't restore the changes."
      renderInfo={(patch) =>
        patch ? (
          <PatchesTabInfoWithPatch
            patch={patch}
            onEditInfo={(info) => editPatch(patch, info)}
          />
        ) : (
          <PatchesTabInfoWithoutPatch />
        )
      }
      renderResourceAdditionFromFilesDrawer={({ onClose }) => (
        <PatchAdditionFromFilesDrawer
          onClose={onClose}
          onAddFromDirectory={addPatchFromDirectory}
          onAddFromFile={addPatchFromFile}
        />
      )}
      renderResourceAdditionFromTemplateDrawer={({ onClose }) => (
        <PatchAdditionFromTemplateDrawer
          onClose={onClose}
          onAdd={async (name, info) => {
            const errorOrPatch = await collection.getPatch(name);
            return errorOrPatch.isError
              ? errorOrPatch.error
              : addPatchFromTemplate(errorOrPatch.value, info);
          }}
        />
      )}
      renderResourceSaveAsTemplateDrawer={({ onClose, resource }) => (
        <PatchTemplateAdditionDrawer
          patch={resource}
          onClose={onClose}
          onAdd={async (info) => {
            const error = await saveAsTemplate(resource, info);
            toast(
              'Patch successfully saved as template',
              'Failed to save patch as template',
              error,
            );
            return error;
          }}
        />
      )}
      columns={columns}
      rows={rows}
    />
  );
}
