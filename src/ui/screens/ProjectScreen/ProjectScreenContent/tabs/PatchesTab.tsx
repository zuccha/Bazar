import { ArrowForwardIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, HStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../core-hooks/ProjectSnapshot';
import { useGetEmbeddedTool } from '../../../../../core-hooks/Toolchain';
import Patch from '../../../../../core/Patch';
import ProjectSnapshot from '../../../../../core/ProjectSnapshot';
import { useGet } from '../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import Output, { OutputChunk } from '../../../../../ui-atoms/display/Output';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../../ui-atoms/display/Table';
import Button from '../../../../../ui-atoms/input/Button';
import AlertDelete from '../../../../../ui-atoms/overlay/AlertDelete';
import { $ErrorReport, ErrorReport } from '../../../../../utils/ErrorReport';
import PatchAdditionDrawer from '../../../../drawers/PatchAdditionDrawer';

interface PatchesTabProps {
  projectSnapshot: ProjectSnapshot;
}

export default function PatchesTab({
  projectSnapshot,
}: PatchesTabProps): ReactElement {
  const [outputChunks, setOutputChunks] = useState<OutputChunk[]>([]);
  const [isPatchAdditionVisible, setPatchAdditionVisible] = useState(false);
  const [patchToRemove, setPatchToRemove] = useState<Patch | undefined>();

  const patches = useProjectSnapshotPatches(projectSnapshot);
  const removePatch = useRemovePatchFromProjectSnapshot(projectSnapshot);

  const handleError = useHandleError();

  const toolchain = useToolchain();
  const asar = useGetEmbeddedTool(toolchain, 'asar');

  const handleClearOutput = useCallback(() => {
    setOutputChunks([]);
  }, []);

  const applyPatch = useCallback(
    async (patch: Patch, exePath: string): Promise<OutputChunk[]> => {
      const newOutputChunks: OutputChunk[] = [];

      newOutputChunks.push({
        text: `Applying patch "${patch.getInfo().name}"`,
        type: 'plain',
      });

      const processOrError = await projectSnapshot.applyPatch(patch, exePath);
      if (processOrError.isError) {
        newOutputChunks.push({
          text: 'Failed to apply patch',
          type: 'failure',
        });
        return newOutputChunks;
      }

      if (processOrError.value.stdout)
        newOutputChunks.push({
          text: processOrError.value.stdout,
          type: 'plain',
        });
      if (processOrError.value.stderr)
        newOutputChunks.push({
          text: processOrError.value.stderr,
          type: 'failure',
        });

      return newOutputChunks;
    },
    [projectSnapshot],
  );

  const handleApplyPatch = useAsyncCallback(
    async (patch: Patch): Promise<ErrorReport | undefined> => {
      if (asar.status !== 'installed') {
        const errorMessage = 'asar is not installed, please install it first';
        const error = $ErrorReport.make(errorMessage);
        handleError(error, 'Failed to apply patch');
        return error;
      }

      const exePath = asar.exePath;
      const newOutputChunks = await applyPatch(patch, exePath);
      setOutputChunks(newOutputChunks);
    },
    [asar, applyPatch, handleError],
  );

  const handleApplyAllPatches = useAsyncCallback(async (): Promise<
    ErrorReport | undefined
  > => {
    if (asar.status !== 'installed') {
      const errorMessage = 'asar is not installed, please install it first';
      const error = $ErrorReport.make(errorMessage);
      handleError(error, 'Failed to apply patch');
      return error;
    }

    const exePath = asar.exePath;
    const newOutputChunks: OutputChunk[] = [];
    for (const patch of patches) {
      newOutputChunks.push(...(await applyPatch(patch, exePath)));
    }
    setOutputChunks(newOutputChunks);
  }, [asar, patches, projectSnapshot]);

  const handleRemovePatch = useAsyncCallback(
    async (patch: Patch) => {
      const error = await removePatch(patch.getInfo().name);
      handleError(error, 'Failed to remove patch');
      return error;
    },
    [removePatch],
  );

  const isEditingPatches =
    !handleApplyAllPatches.isLoading && !handleApplyPatch.isLoading;

  const actions: TableAction<Patch>[] = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: isEditingPatches || asar.status !== 'installed',
        label: 'Apply patch',
        onClick: (row) => handleApplyPatch.call(row.data),
      },
      {
        icon: <EditIcon />,
        label: 'Open patch in editor',
        isDisabled: true,
        onClick: () => {},
      },
      {
        icon: <DeleteIcon />,
        label: 'Remove patch',
        onClick: (row) => setPatchToRemove(row.data),
      },
    ];
  }, [handleApplyPatch.call, isEditingPatches, asar.status]);

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
      return projectSnapshot.getPatches().map((patch) => ({
        data: patch,
        key: patch.getInfo().name,
      }));
    }, [projectSnapshot]),
    ProjectSnapshot.getPatchesDeps,
  );

  return (
    <>
      <Flex h='100%'>
        <Flex flexDir='column' h='100%' w={512}>
          <Table
            actions={actions}
            columns={columns}
            rows={rows}
            flex={1}
            width='100%'
          />
          <HStack justifyContent='flex-end' mt={2}>
            <Button
              label='Apply all'
              onClick={handleApplyAllPatches.call}
              isDisabled={isEditingPatches || asar.status !== 'installed'}
            />
            <Button label='Add' onClick={() => setPatchAdditionVisible(true)} />
          </HStack>
        </Flex>
        <Flex w={512} h='100%' ml={3} flexDir='column' borderColor='app.bg1'>
          <Output chunks={outputChunks} onClear={handleClearOutput} />
        </Flex>
      </Flex>

      {isPatchAdditionVisible && (
        <PatchAdditionDrawer
          onClose={() => setPatchAdditionVisible(false)}
          projectSnapshot={projectSnapshot}
        />
      )}

      {patchToRemove && (
        <AlertDelete
          isDisabled={handleRemovePatch.isLoading}
          onClose={() => setPatchToRemove(undefined)}
          onDelete={() => handleRemovePatch.call(patchToRemove)}
          title={`Remove patch "${patchToRemove.getInfo().name}"`}
        />
      )}
    </>
  );
}
