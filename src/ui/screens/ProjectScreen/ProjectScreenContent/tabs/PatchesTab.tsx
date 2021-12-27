import { ArrowForwardIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, HStack } from '@chakra-ui/react';
import { ReactElement, useMemo, useState } from 'react';
import {
  useProjectSnapshotPatches,
  useRemovePatchFromProjectSnapshot,
} from '../../../../../core-hooks/ProjectSnapshot';
import Patch from '../../../../../core/Patch';
import ProjectSnapshot from '../../../../../core/ProjectSnapshot';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import Output from '../../../../../ui-atoms/display/Output';
import Table from '../../../../../ui-atoms/display/Table';
import Button from '../../../../../ui-atoms/input/Button';
import AlertDelete from '../../../../../ui-atoms/overlay/AlertDelete';
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

  const actions = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        tooltip: 'Apply patch',
        onClick: () => {},
      },
      {
        icon: <EditIcon />,
        tooltip: 'Open patch in editor',
        onClick: () => {},
      },
      {
        icon: <DeleteIcon />,
        tooltip: 'Remove patch',
        onClick: (patch: Patch) => {
          setPatchToRemove(patch);
        },
      },
    ];
  }, []);

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
          <Output output='' />
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
