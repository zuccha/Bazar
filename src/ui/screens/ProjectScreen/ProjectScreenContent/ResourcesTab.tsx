import { ArrowForwardIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useMemo } from 'react';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../hooks/useHandleError';
import useSafeState from '../../../../hooks/usSafeState';
import Info from '../../../../ui-atoms/display/Info';
import Output, { OutputChunk } from '../../../../ui-atoms/display/Output';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../ui-atoms/display/Table';
import Button from '../../../../ui-atoms/input/Button';
import AlertDelete from '../../../../ui-atoms/overlay/AlertDelete';
import { EitherErrorOr } from '../../../../utils/EitherErrorOr';
import { $ErrorReport, ErrorReport } from '../../../../utils/ErrorReport';
import { Process } from '../../../../utils/Shell';
import { $String } from '../../../../utils/String';

type Resource = {
  getInfo: () => { name: string };
};

interface ResourcesTabProps<R extends Resource> {
  name: string;
  resources: R[];

  canApply: boolean;
  canRemove: boolean;
  canOpenInEditor: boolean;

  onApply: (resource: R) => Promise<EitherErrorOr<Process>>;
  onRemove: (resource: R) => Promise<ErrorReport | undefined>;
  onOpenInEditor: (resource: R) => Promise<ErrorReport | undefined>;

  renderInfo: (resource: R | undefined) => ReactElement;
  renderResourceAdditionDrawer: (params: {
    onClose: () => void;
  }) => ReactElement;

  columns: TableColumn<R>[];
  rows: TableRow<R>[];
}

export default function ResourcesTab<R extends Resource>({
  name,
  resources,

  canApply,
  canOpenInEditor,
  canRemove,

  onApply,
  onOpenInEditor,
  onRemove,

  renderInfo,
  renderResourceAdditionDrawer,

  columns,
  rows,
}: ResourcesTabProps<R>): ReactElement {
  const handleError = useHandleError();

  const [outputChunks, setOutputChunks] = useSafeState<OutputChunk[]>([]);
  const handleClearOutput = useCallback(() => setOutputChunks([]), []);

  const [resourceToRemove, setResourceToRemove] = useSafeState<R | undefined>(
    undefined,
  );

  const [selectedRowIndex, setSelectedRowIndex] = useSafeState<
    number | undefined
  >(undefined);

  const [isResourceAdditionDrawerVisible, setIsResourceAdditionDrawerVisible] =
    useSafeState(false);

  const apply = useCallback(
    async (resource: R): Promise<OutputChunk[]> => {
      const newOutputChunks: OutputChunk[] = [];

      newOutputChunks.push({
        text: `Applying patch "${resource.getInfo().name}"`,
        type: 'info',
        isBold: true,
      });

      const processOrError = await onApply(resource);
      if (processOrError.isError) {
        newOutputChunks.push({
          text: `Failed to apply ${name}`,
          type: 'failure',
          isBold: true,
        });
        return newOutputChunks;
      }

      if (processOrError.value.stdout) {
        newOutputChunks.push({
          text: processOrError.value.stdout,
          type: 'plain',
        });
      }
      if (processOrError.value.stderr) {
        newOutputChunks.push({
          text: processOrError.value.stderr,
          type: 'failure',
        });
        newOutputChunks.push({
          text: `Failed to ${name} patch`,
          type: 'failure',
          isBold: true,
        });
      } else {
        newOutputChunks.push({
          text: `${$String.capitalize(name)} applied successfully`,
          type: 'success',
          isBold: true,
        });
      }

      return newOutputChunks;
    },
    [onApply],
  );

  const handleApply = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canApply) {
        const errorMessage = `Cannot apply ${name}`;
        const error = $ErrorReport.make(errorMessage);
        handleError(error, `Failed to apply ${name}`);
        return error;
      }

      const newOutputChunks = await apply(resource);
      setOutputChunks(newOutputChunks);
    },
    [apply, canApply, handleError],
  );

  const handleApplyAll = useAsyncCallback(async (): Promise<
    ErrorReport | undefined
  > => {
    if (!canApply) {
      const errorMessage = `Cannot apply ${name}`;
      const error = $ErrorReport.make(errorMessage);
      handleError(error, `Failed to apply ${name}`);
      return error;
    }

    const newOutputChunks: OutputChunk[] = [];
    for (const resource of resources) {
      newOutputChunks.push(...(await apply(resource)));
    }
    setOutputChunks(newOutputChunks);
  }, [apply, canApply, handleError, resources]);

  const handleOpenInEditor = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canOpenInEditor) {
        const errorMessage = `Cannot open ${name} in editor`;
        const error = $ErrorReport.make(errorMessage);
        handleError(error, `Failed to open ${name} in editor`);
        return error;
      }

      const maybeError = await onOpenInEditor(resource);
      handleError(maybeError, `Failed to open ${name} in editor`);
      return maybeError;
    },
    [onOpenInEditor, canOpenInEditor, handleError],
  );

  const handleRemove = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canRemove) {
        const errorMessage = `Cannot remove ${name}`;
        const error = $ErrorReport.make(errorMessage);
        handleError(error, `Failed to remove ${name}`);
        return error;
      }

      const maybeError = await onRemove(resource);
      handleError(maybeError, `Failed to remove ${name}`);
      return maybeError;
    },
    [onRemove, canRemove, handleError],
  );

  const isApplying = handleApply.isLoading || handleApplyAll.isLoading;

  const actions: TableAction<R>[] = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: !canApply || isApplying,
        label: 'Apply patch',
        onClick: (row) => handleApply.call(row.data),
      },
      {
        icon: <EditIcon />,
        isDisabled: !canOpenInEditor || isApplying,
        label: 'Open in editor',
        onClick: (row) => handleOpenInEditor.call(row.data),
      },
      {
        icon: <DeleteIcon />,
        isDisabled: !canRemove || !!resourceToRemove,
        label: 'Remove',
        onClick: (row) => setResourceToRemove(row.data),
      },
    ];
  }, [
    canApply,
    canOpenInEditor,
    canRemove,
    handleApply.call,
    handleOpenInEditor.call,
    isApplying,
    resourceToRemove,
  ]);

  return (
    <>
      <HStack h='100%' spacing={3} alignItems='stretch'>
        <VStack flex={1} minW={512} spacing={3}>
          <Table
            actions={actions}
            columns={columns}
            rows={rows}
            selectedRowIndex={selectedRowIndex}
            onSelectRowIndex={setSelectedRowIndex}
            flex={1}
            width='100%'
          />
          <HStack w='100%' justifyContent='flex-end'>
            <Button
              label='Apply all'
              onClick={handleApplyAll.call}
              isDisabled={!canApply || isApplying || !rows.length}
            />
            <Button
              label='Add'
              onClick={() => setIsResourceAdditionDrawerVisible(true)}
            />
          </HStack>
        </VStack>
        <VStack flex={1} minW={512} spacing={3}>
          <Info width='100%'>
            {renderInfo(
              selectedRowIndex !== undefined
                ? rows[selectedRowIndex]?.data
                : undefined,
            )}
          </Info>
          <Output
            chunks={outputChunks}
            onClear={handleClearOutput}
            flex={1}
            width='100%'
          />
        </VStack>
      </HStack>

      {isResourceAdditionDrawerVisible &&
        renderResourceAdditionDrawer({
          onClose: () => setIsResourceAdditionDrawerVisible(false),
        })}

      {!!resourceToRemove && (
        <AlertDelete
          isDisabled={handleRemove.isLoading}
          onClose={() => setResourceToRemove(undefined)}
          onDelete={() => handleRemove.call(resourceToRemove)}
          title={`Remove ${name} "${resourceToRemove.getInfo().name}"`}
        />
      )}
    </>
  );
}
