import {
  ArrowForwardIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { Flex, HStack, VStack } from '@chakra-ui/react';
import { ReactElement, useCallback, useMemo } from 'react';
import useAsyncCallback from '../../../../hooks/useAsyncCallback';
import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
import useToast from '../../../../hooks/useToast';
import useSafeState from '../../../../hooks/usSafeState';
import Button from '../../../../ui-atoms/Button';
import DialogWithIrreversibleAction from '../../../../ui-atoms/DialogWithIrreversibleAction';
import Frame from '../../../../ui-atoms/Frame';
import IconButton from '../../../../ui-atoms/IconButton';
import Output, {
  chunksToString,
  OutputChunk,
} from '../../../../ui-atoms/Output';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../ui-atoms/Table';
import { EitherErrorOr } from '../../../../utils/EitherErrorOr';
import ErrorReport from '../../../../utils/ErrorReport';
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
  canSaveAsTemplate: boolean;

  onApply: (resource: R) => Promise<EitherErrorOr<Process>>;
  onRemove: (resource: R) => Promise<ErrorReport | undefined>;
  onOpenInEditor: (resource: R) => Promise<ErrorReport | undefined>;

  renderInfo: (resource: R | undefined) => ReactElement;
  renderResourceAdditionFromFilesDrawer: (params: {
    onClose: () => void;
  }) => ReactElement;
  renderResourceAdditionFromTemplateDrawer: (params: {
    onClose: () => void;
  }) => ReactElement;
  renderResourceSaveAsTemplateDrawer: (params: {
    resource: R;
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
  canSaveAsTemplate,

  onApply,
  onOpenInEditor,
  onRemove,

  renderInfo,
  renderResourceAdditionFromFilesDrawer,
  renderResourceAdditionFromTemplateDrawer,
  renderResourceSaveAsTemplateDrawer,

  columns,
  rows,
}: ResourcesTabProps<R>): ReactElement {
  const toast = useToast();

  const [outputChunks, setOutputChunks] = useSafeState<OutputChunk[]>([]);
  const handleClearOutput = useCallback(() => setOutputChunks([]), []);

  const [resourceToRemove, setResourceToRemove] = useSafeState<R | undefined>(
    undefined,
  );

  const [resourceToSaveAsTemplate, setResourceToSaveAsTemplate] = useSafeState<
    R | undefined
  >(undefined);

  const [selectedRowIndex, setSelectedRowIndex] = useSafeState<
    number | undefined
  >(undefined);

  const [
    isResourceAdditionFromFilesDrawerVisible,
    setIsResourceAdditionFromFilesDrawerVisible,
  ] = useSafeState(false);

  const [
    isResourceAdditionFromTemplateDrawerVisible,
    setIsResourceAdditionFromTemplateDrawerVisible,
  ] = useSafeState(false);

  const apply = useCallback(
    async (resource: R): Promise<OutputChunk[]> => {
      const newOutputChunk: OutputChunk = [];

      newOutputChunk.push({
        text: `Applying ${name} "${resource.getInfo().name}"`,
        type: 'info',
        isBold: true,
      });

      const processOrError = await onApply(resource);
      if (processOrError.isError) {
        newOutputChunk.push({
          text: `Failed to apply ${name}`,
          type: 'failure',
          isBold: true,
        });
        return [newOutputChunk];
      }

      if (processOrError.value.stdout) {
        newOutputChunk.push({
          text: processOrError.value.stdout,
          type: 'plain',
        });
      }
      if (processOrError.value.stderr) {
        newOutputChunk.push({
          text: processOrError.value.stderr,
          type: 'failure',
        });
        newOutputChunk.push({
          text: `Failed to apply ${name}`,
          type: 'failure',
          isBold: true,
        });
      } else {
        newOutputChunk.push({
          text: `${$String.capitalize(name)} applied successfully`,
          type: 'success',
          isBold: true,
        });
      }

      return [newOutputChunk];
    },
    [onApply],
  );

  const handleApply = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canApply) {
        const errorMessage = `Cannot apply ${name}`;
        const error = ErrorReport.from(errorMessage);
        if (error) toast.failure(`Failed to apply ${name}`, error);
        return error;
      }

      const newOutputChunks = await apply(resource);
      setOutputChunks(newOutputChunks);
    },
    [apply, canApply, toast],
  );

  const handleApplyAll = useAsyncCallback(async (): Promise<
    ErrorReport | undefined
  > => {
    if (!canApply) {
      const errorMessage = `Cannot apply ${name}`;
      const error = ErrorReport.from(errorMessage);
      if (error) toast.failure(`Failed to apply ${name}`, error);
      return error;
    }

    const newOutputChunks: OutputChunk[] = [];
    for (const resource of resources) {
      newOutputChunks.push(...(await apply(resource)));
    }
    setOutputChunks(newOutputChunks);
  }, [apply, canApply, toast, resources]);

  const handleOpenInEditor = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canOpenInEditor) {
        const errorMessage = `Cannot open ${name} in editor`;
        const error = ErrorReport.from(errorMessage);
        if (error) toast.failure(`Failed to open ${name} in editor`, error);
        return error;
      }

      const error = await onOpenInEditor(resource);
      if (error) toast.failure(`Failed to open ${name} in editor`, error);
      return error;
    },
    [onOpenInEditor, canOpenInEditor, toast],
  );

  const handleRemove = useAsyncCallback(
    async (resource: R): Promise<ErrorReport | undefined> => {
      if (!canRemove) {
        const errorMessage = `Cannot remove ${name}`;
        const error = ErrorReport.from(errorMessage);
        if (error) toast.failure(`Failed to remove ${name}`, error);
        return error;
      }

      const error = await onRemove(resource);
      if (error) toast.failure(`Failed to remove ${name}`, error);
      return error;
    },
    [onRemove, canRemove, toast],
  );

  const isApplying = handleApply.isLoading || handleApplyAll.isLoading;

  const actions: TableAction<R>[] = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: !canApply || isApplying,
        label: `Apply ${name}`,
        onClick: (row) => handleApply.call(row.data),
      },
      {
        icon: <ExternalLinkIcon />,
        isDisabled: !canOpenInEditor || handleOpenInEditor.isLoading,
        label: `Open ${name} in editor`,
        onClick: (row) => handleOpenInEditor.call(row.data),
      },
      {
        icon: <DeleteIcon />,
        isDisabled: !canRemove || !!resourceToRemove,
        label: `Remove ${name}`,
        onClick: (row) => setResourceToRemove(row.data),
      },
      {
        icon: <DownloadIcon />,
        isDisabled: !canSaveAsTemplate || !!resourceToSaveAsTemplate,
        label: `Save ${name} as template`,
        onClick: (row) => setResourceToSaveAsTemplate(row.data),
      },
    ];
  }, [
    name,
    canApply,
    canOpenInEditor,
    canRemove,
    canSaveAsTemplate,
    handleApply.call,
    handleOpenInEditor.call,
    handleOpenInEditor.isLoading,
    isApplying,
    resourceToRemove,
    resourceToSaveAsTemplate,
  ]);

  const copyToClipboard = useCopyToClipboard();

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
              label='Add new'
              onClick={() => setIsResourceAdditionFromFilesDrawerVisible(true)}
            />
            <Button
              label='Add from template'
              onClick={() =>
                setIsResourceAdditionFromTemplateDrawerVisible(true)
              }
            />
          </HStack>
        </VStack>
        <VStack flex={1} minW={512} spacing={3}>
          <Frame title='Info' width='100%'>
            <Flex p={4} width='100%'>
              {renderInfo(
                selectedRowIndex !== undefined
                  ? rows[selectedRowIndex]?.data
                  : undefined,
              )}
            </Flex>
          </Frame>
          <Frame
            title='Output'
            flex={1}
            width='100%'
            actions={
              <HStack spacing={1}>
                <IconButton
                  icon={<CopyIcon />}
                  isDisabled={
                    outputChunks.length === 0 || copyToClipboard.isLoading
                  }
                  label='Copy'
                  onClick={() =>
                    copyToClipboard.call(chunksToString(outputChunks))
                  }
                  variant='ghost'
                />
                <IconButton
                  icon={<DeleteIcon />}
                  isDisabled={outputChunks.length === 0}
                  label='Clear'
                  onClick={handleClearOutput}
                  variant='ghost'
                />
              </HStack>
            }
          >
            <Output
              chunks={outputChunks}
              width='100%'
              flex={1}
              overflow='auto'
            />
          </Frame>
        </VStack>
      </HStack>

      {isResourceAdditionFromFilesDrawerVisible &&
        renderResourceAdditionFromFilesDrawer({
          onClose: () => setIsResourceAdditionFromFilesDrawerVisible(false),
        })}

      {isResourceAdditionFromTemplateDrawerVisible &&
        renderResourceAdditionFromTemplateDrawer({
          onClose: () => setIsResourceAdditionFromTemplateDrawerVisible(false),
        })}

      {!!resourceToRemove && (
        <DialogWithIrreversibleAction
          action='Remove'
          isDisabled={handleRemove.isLoading}
          onClose={() => setResourceToRemove(undefined)}
          onDelete={() => handleRemove.call(resourceToRemove)}
          title={`Remove ${name} "${resourceToRemove.getInfo().name}"`}
        />
      )}

      {!!resourceToSaveAsTemplate &&
        renderResourceSaveAsTemplateDrawer({
          resource: resourceToSaveAsTemplate,
          onClose: () => setResourceToSaveAsTemplate(undefined),
        })}
    </>
  );
}
