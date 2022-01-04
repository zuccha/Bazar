import { ReactElement, useCallback, useMemo } from 'react';
import { useToolchain } from '../../../../../../core-hooks/Core';
import {
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../../core-hooks/ProjectSnapshot';
import { useGetEmbeddedTool } from '../../../../../../core-hooks/Toolchain';
import Patch from '../../../../../../core/Patch';
import ProjectSnapshot from '../../../../../../core/ProjectSnapshot';
import { asGlobalDeps, useGet } from '../../../../../../hooks/useAccessors';
import { TableColumn, TableRow } from '../../../../../../ui-atoms/Table';
import { $EitherErrorOr } from '../../../../../../utils/EitherErrorOr';
import { $ErrorReport } from '../../../../../../utils/ErrorReport';
import PatchAdditionDrawer from '../../../../../drawers/PatchAdditionDrawer';
import ResourcesTab from '../../ResourcesTab';
import PatchesTabInfo from './PatchesTabInfo';

interface PatchesTabProps {
  projectSnapshot: ProjectSnapshot;
}

const rowsDeps = [
  ...ProjectSnapshot.getPatchesDeps,
  ...asGlobalDeps(Patch.updateInfoTriggers),
];

export default function PatchesTab({
  projectSnapshot,
}: PatchesTabProps): ReactElement {
  const toolchain = useToolchain();
  const asar = useGetEmbeddedTool(toolchain, 'asar');

  const patches = useProjectSnapshotPatches(projectSnapshot);

  const handleApplyPatch = useCallback(
    async (patch: Patch) => {
      return asar.status === 'installed'
        ? await projectSnapshot.applyPatch(patch, asar.exePath)
        : $EitherErrorOr.error($ErrorReport.make('asar not installed'));
    },
    [projectSnapshot.applyPatch],
  );

  const handleRemovePatch = useRemovePatchFromProjectSnapshot(projectSnapshot);

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

  const rows: TableRow<Patch>[] = useGet(
    projectSnapshot,
    useCallback(() => {
      return patches.map((patch) => ({
        data: patch,
        key: patch.getInfo().name,
      }));
    }, [patches]),
    rowsDeps,
  );

  return (
    <ResourcesTab
      name='patch'
      resources={patches}
      canApply={asar.status === 'installed'}
      canOpenInEditor={false}
      canRemove={true}
      onApply={handleApplyPatch}
      onOpenInEditor={() => Promise.resolve(undefined)}
      onRemove={handleRemovePatch}
      renderInfo={(patch) => <PatchesTabInfo patch={patch} />}
      renderResourceAdditionDrawer={({ onClose }) => (
        <PatchAdditionDrawer
          onClose={onClose}
          projectSnapshot={projectSnapshot}
        />
      )}
      columns={columns}
      rows={rows}
    />
  );
}
