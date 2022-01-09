import { DeleteIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ReactElement, useMemo, useState } from 'react';
import {
  useCollectionProjectSnapshotNames,
  useDeleteProjectSnapshotFromCollection,
} from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import { useList } from '../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../hooks/useToast';
import DialogWithIrreversibleAction from '../../../../../ui-atoms/DialogWithIrreversibleAction';
import Header from '../../../../../ui-atoms/Header';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../../ui-atoms/Table';
import ProjectsCollectionPageInfo from './PatchesCollectionPageInfo';

export default function ProjectsCollectionPage(): ReactElement {
  const toast = useToast();

  const collection = useCollection();
  const projectSnapshotNames = useCollectionProjectSnapshotNames(collection);

  const [selectedNameIndex, setSelectedNameIndex] = useState<
    number | undefined
  >(undefined);

  const [nameToDelete, setNameToDelete] = useState<string | undefined>();
  const deleteProjectSnapshot =
    useDeleteProjectSnapshotFromCollection(collection);
  const handleDelete = useAsyncCallback(async () => {
    if (nameToDelete) {
      const error = await deleteProjectSnapshot(nameToDelete);
      if (error) toast.failure('Failed to delete project', error);
      return error;
    }
  }, [toast, nameToDelete, deleteProjectSnapshot]);

  const isDisabled = !!nameToDelete || handleDelete.isLoading;

  const actions: TableAction<string>[] = useMemo(() => {
    return [
      {
        icon: <DeleteIcon />,
        isDisabled: isDisabled,
        label: `Remove project`,
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

  const rows: TableRow<string>[] = useList(projectSnapshotNames).map(
    (projectSnapshotName) => ({
      data: projectSnapshotName,
      key: projectSnapshotName,
    }),
  );

  const selectedName =
    selectedNameIndex !== undefined && projectSnapshotNames[selectedNameIndex];

  return (
    <>
      <Flex flexDir='column' flex={1} overflow='auto'>
        <Table
          actions={actions}
          columns={columns}
          rows={rows}
          selectedRowIndex={selectedNameIndex}
          onSelectRowIndex={setSelectedNameIndex}
          variant='minimal'
          flex={1}
        />
        {selectedName && (
          <>
            <Header
              title='Info'
              hideBorderLeft
              hideBorderRight
              variant='minimal'
            />
            <Flex p={4} width='100%' overflow='auto'>
              <ProjectsCollectionPageInfo name={selectedName} />
            </Flex>
          </>
        )}
      </Flex>

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
