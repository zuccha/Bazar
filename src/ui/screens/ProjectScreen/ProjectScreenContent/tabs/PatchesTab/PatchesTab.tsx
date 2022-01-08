import { ReactElement, useCallback, useMemo } from 'react';
import { useAddPatchToCollectionFromExisting } from '../../../../../../core-hooks/Collection';
import { useCollection, useToolchain } from '../../../../../../core-hooks/Core';
import {
  useAddPatchToProjectSnapshotFromDirectory,
  useAddPatchToProjectSnapshotFromFile,
  useAddPatchToProjectSnapshotFromTemplate,
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../../core-hooks/ProjectSnapshot';
import { useGetEmbeddedTool } from '../../../../../../core-hooks/Toolchain';
import Patch from '../../../../../../core/Patch';
import ProjectSnapshot from '../../../../../../core/ProjectSnapshot';
import { useList } from '../../../../../../hooks/useAccessors';
import { TableColumn, TableRow } from '../../../../../../ui-atoms/Table';
import { $EitherErrorOr } from '../../../../../../utils/EitherErrorOr';
import ErrorReport from '../../../../../../utils/ErrorReport';
import PatchAdditionFromFilesDrawer from '../../../../../drawers/PatchAdditionFromFilesDrawer';
import PatchAdditionFromTemplateDrawer from '../../../../../drawers/PatchAdditionFromTemplateDrawer';
import PatchTemplateAdditionDrawer from '../../../../../drawers/PatchTemplateAdditionDrawer';
import ResourcesTab from '../../ResourcesTab';
import PatchesTabInfo from './PatchesTabInfo';

interface PatchesTabProps {
  projectSnapshot: ProjectSnapshot;
}

export default function PatchesTab({
  projectSnapshot,
}: PatchesTabProps): ReactElement {
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

  const handleApplyPatch = useCallback(
    async (patch: Patch) => {
      return asar.status === 'installed'
        ? await projectSnapshot.applyPatch(patch, asar.exePath)
        : $EitherErrorOr.error(ErrorReport.from('asar not installed'));
    },
    [projectSnapshot.applyPatch],
  );

  const handleRemovePatch = useRemovePatchFromProjectSnapshot(projectSnapshot);

  const addPatchFromExisting = useAddPatchToCollectionFromExisting(collection);

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
      onApply={handleApplyPatch}
      onOpenInEditor={() => Promise.resolve(undefined)}
      onRemove={handleRemovePatch}
      renderInfo={(patch) => <PatchesTabInfo patch={patch} />}
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
          onAdd={(name) => addPatchFromTemplate(name, collection)}
        />
      )}
      renderResourceSaveAsTemplateDrawer={({ onClose, resource }) => (
        <PatchTemplateAdditionDrawer
          patch={resource}
          onClose={onClose}
          onAdd={() => addPatchFromExisting(resource)}
        />
      )}
      columns={columns}
      rows={rows}
    />
  );
}
