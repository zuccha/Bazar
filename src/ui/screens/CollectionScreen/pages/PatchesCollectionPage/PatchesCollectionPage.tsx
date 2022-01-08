import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ReactElement, useLayoutEffect, useMemo, useState } from 'react';
import {
  useAddPatchToCollectionFromDirectory,
  useAddPatchToCollectionFromFile,
  useCollectionPatchNames,
  useDeletePatchFromCollection,
} from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import Patch from '../../../../../core/Patch';
import { useList } from '../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';
import useSafeState from '../../../../../hooks/usSafeState';
import DialogWithIrreversibleAction from '../../../../../ui-atoms/DialogWithIrreversibleAction';
import Frame from '../../../../../ui-atoms/Frame';
import Header from '../../../../../ui-atoms/Header';
import Table, {
  TableAction,
  TableColumn,
  TableHeaderAction,
  TableRow,
} from '../../../../../ui-atoms/Table';
import PatchAdditionFromFilesDrawer from '../../../../drawers/PatchAdditionFromFilesDrawer';
import PatchesCollectionPageInfo from './PatchesCollectionPageInfo';

export default function PatchesCollectionPage(): ReactElement {
  const toast = useToast();

  const [isPatchAdditionDrawerVisible, setIsPatchAdditionDrawerVisible] =
    useSafeState(false);

  const collection = useCollection();
  const patchNames = useCollectionPatchNames(collection);

  const [selectedPatchIndex, setSelectedPatchIndex] = useSafeState<
    number | undefined
  >(undefined);

  const [selectedPatch, setSelectedPatch] = useState<Patch | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    if (selectedPatchIndex !== undefined) {
      const patchName = patchNames[selectedPatchIndex];
      if (patchName) {
        collection.getPatch(patchName).then((errorOrPatch) => {
          if (errorOrPatch.isError)
            toast.failure('Failed to select patch', errorOrPatch.error);
          errorOrPatch.isError
            ? setSelectedPatch(undefined)
            : setSelectedPatch(errorOrPatch.value);
        });
      }
    } else {
      setSelectedPatch(undefined);
    }
  }, [collection, selectedPatchIndex]);

  const addPatchFromDirectory =
    useAddPatchToCollectionFromDirectory(collection);
  const addPatchFromFile = useAddPatchToCollectionFromFile(collection);

  const [nameToDelete, setNameToDelete] = useState<string | undefined>();
  const deletePatch = useDeletePatchFromCollection(collection);
  const handleDelete = useAsyncCallback(async () => {
    if (nameToDelete) {
      const error = await deletePatch(nameToDelete);
      if (error) toast.failure('Failed to delete patch', error);
      else setSelectedPatchIndex(undefined);
      return error;
    }
  }, [toast, nameToDelete, deletePatch]);

  const isDisabled = !!nameToDelete || handleDelete.isLoading;

  const headerActions: TableHeaderAction[] = useMemo(() => {
    return [
      {
        icon: <AddIcon />,
        isDisabled: isDisabled,
        label: `Add patch`,
        onClick: () => setIsPatchAdditionDrawerVisible(true),
      },
    ];
  }, [isDisabled]);

  const actions: TableAction<string>[] = useMemo(() => {
    return [
      {
        icon: <ExternalLinkIcon />,
        isDisabled: true,
        label: `Open patch in editor`,
        onClick: (row) => {},
      },
      {
        icon: <DeleteIcon />,
        isDisabled: isDisabled,
        label: `Remove patch`,
        onClick: (row) => setNameToDelete(row.data),
      },
    ];
  }, [isDisabled]);

  const columns: TableColumn<string>[] = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Name',
        getValue: (row) => row.data,
        width: 'fill',
      },
    ];
  }, []);

  const rows: TableRow<string>[] = useList(patchNames).map((patchName) => ({
    data: patchName,
    key: patchName,
  }));

  return (
    <>
      <Flex flexDir='column' flex={1} overflow='auto'>
        <Table
          actions={actions}
          headerActions={headerActions}
          columns={columns}
          rows={rows}
          selectedRowIndex={selectedPatchIndex}
          onSelectRowIndex={setSelectedPatchIndex}
          variant='minimal'
          flex={1}
          minHeight='200px'
        />
        {selectedPatch && (
          <>
            <Header
              title='Info'
              hideBorderLeft
              hideBorderRight
              variant='minimal'
            />
            <Flex p={4} width='100%' overflow='auto'>
              <PatchesCollectionPageInfo patch={selectedPatch} />
            </Flex>
          </>
        )}
      </Flex>

      {isPatchAdditionDrawerVisible && (
        <PatchAdditionFromFilesDrawer
          onClose={() => setIsPatchAdditionDrawerVisible(false)}
          onAddFromDirectory={addPatchFromDirectory}
          onAddFromFile={addPatchFromFile}
        />
      )}

      {!!nameToDelete && (
        <DialogWithIrreversibleAction
          action='Delete'
          isDisabled={handleDelete.isLoading}
          onClose={() => setNameToDelete(undefined)}
          onDelete={handleDelete.call}
          title={`Delete ${nameToDelete}?`}
        />
      )}
    </>
  );
}
