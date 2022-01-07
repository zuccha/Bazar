import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { ReactElement, useMemo, useState } from 'react';
import { useCollectionProjectSnapshotNames } from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import { useList } from '../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import DialogWithIrreversibleAction from '../../../../../ui-atoms/DialogWithIrreversibleAction';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../../ui-atoms/Table';
import ProjectTemplateEditorDrawer from '../../../../drawers/ProjectTemplateEditorDrawer';

export default function ProjectsCollectionPage(): ReactElement {
  const collection = useCollection();
  const projectSnapshotNames = useCollectionProjectSnapshotNames(collection);

  const [nameToDelete, setNameToDelete] = useState<string | undefined>();
  const handleDelete = useAsyncCallback(async () => {
    return undefined;
  }, []);

  const [nameToEdit, setNameToEdit] = useState<string | undefined>();
  const handleEdit = useAsyncCallback(async (name: string) => {
    return undefined;
  }, []);

  const isDisabled =
    !!nameToEdit ||
    !!nameToDelete ||
    handleEdit.isLoading ||
    handleDelete.isLoading;

  const actions: TableAction<string>[] = useMemo(() => {
    return [
      {
        icon: <EditIcon />,
        isDisabled: isDisabled,
        label: `Edit project`,
        onClick: (row) => setNameToEdit(row.data),
      },
      {
        icon: <DeleteIcon />,
        isDisabled: isDisabled,
        label: `Remove ${name}`,
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

  return (
    <>
      <Table
        actions={actions}
        columns={columns}
        rows={rows}
        variant='minimal'
        flex={1}
      />

      {!!nameToDelete && (
        <DialogWithIrreversibleAction
          action='Delete'
          isDisabled={handleDelete.isLoading}
          onClose={() => setNameToDelete(undefined)}
          onDelete={handleDelete.call}
          title={`Delete ${nameToDelete}?`}
        />
      )}

      {!!nameToEdit && (
        <ProjectTemplateEditorDrawer
          name={nameToEdit}
          onClose={() => setNameToEdit(undefined)}
          onEdit={handleEdit.call}
        />
      )}
    </>
  );
}
