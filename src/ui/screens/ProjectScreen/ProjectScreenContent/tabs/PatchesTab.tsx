import { ArrowForwardIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, HStack } from '@chakra-ui/react';
import { ReactElement, useMemo, useState } from 'react';
import { useToolchain } from '../../../../../core-hooks/Core';
import {
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../core-hooks/ProjectSnapshot';
import { useGetEmbeddedTool } from '../../../../../core-hooks/Toolchain';
import Patch from '../../../../../core/Patch';
import ProjectSnapshot from '../../../../../core/ProjectSnapshot';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import Output, { OutputChunk } from '../../../../../ui-atoms/display/Output';
import Table from '../../../../../ui-atoms/display/Table';
import Button from '../../../../../ui-atoms/input/Button';
import AlertDelete from '../../../../../ui-atoms/overlay/AlertDelete';
import { $ErrorReport, ErrorReport } from '../../../../../utils/ErrorReport';
import PatchAdditionDrawer from '../../../../drawers/PatchAdditionDrawer';

const columns = [
  { name: 'Name', render: (patch: Patch) => patch.getInfo().name },
] as const;

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
  const handleRemovePatch = useAsyncCallback(
    async (patch: Patch) => {
      const error = await removePatch(patch.getInfo().name);
      handleError(error, 'Failed to remove patch');
      return error;
    },
    [removePatch],
  );

  const toolchain = useToolchain();
  const asar = useGetEmbeddedTool(toolchain, 'asar');

  const handleApplyPatch = useAsyncCallback(
    async (patch: Patch): Promise<ErrorReport | undefined> => {
      if (asar.status !== 'installed') {
        const errorMessage = 'asar is not installed, please install it first';
        const error = $ErrorReport.make(errorMessage);
        handleError(error, 'Failed to apply patch');
        return error;
      }

      const exePath = asar.exePath;
      const processOrError = await projectSnapshot.applyPatch(patch, exePath);
      if (processOrError.isError) {
        handleError(processOrError.error, 'Failed to apply patch');
        return processOrError.error;
      }

      const newOutputChunks: OutputChunk[] = [];
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
      else
        newOutputChunks.push({
          text: 'Patch applied successfully!',
          type: 'success',
          isBold: true,
        });

      setOutputChunks(newOutputChunks);
    },
    [asar, projectSnapshot],
  );

  const actions = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: asar.status !== 'installed' || handleApplyPatch.isLoading,
        tooltip: 'Apply patch',
        onClick: handleApplyPatch.call,
      },
      {
        icon: <EditIcon />,
        tooltip: 'Open patch in editor',
        onClick: () => {},
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Remove patch',
        onClick: setPatchToRemove,
      },
    ];
  }, [handleApplyPatch]);

  return (
    <>
      <Flex h='100%'>
        <Flex flexDir='column' h='100%' w={512}>
          <Flex
            flexDir='column'
            flex={1}
            h='100%'
            borderColor='app.bg1'
            borderWidth={1}
          >
            <Table
              actions={actions}
              columns={columns}
              items={patches}
              getItemKey={(patch) => patch.getInfo().name}
            />
          </Flex>
          <HStack justifyContent='flex-end' mt={2}>
            <Button label='Apply all' onClick={() => {}} isDisabled />
            <Button label='Add' onClick={() => setPatchAdditionVisible(true)} />
          </HStack>
        </Flex>
        <Flex w={512} h='100%' ml={3} flexDir='column' borderColor='app.bg1'>
          <Output chunks={outputChunks} />
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
