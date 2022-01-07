import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { ReactElement, useMemo, useState } from 'react';
import {
  useCollectionPatchNames,
  useDeletePatchFromCollection,
  useEditPatchInCollection,
} from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import { useList } from '../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../hooks/useAsyncCallback';
import useHandleError from '../../../../../hooks/useHandleError';
import DialogWithIrreversibleAction from '../../../../../ui-atoms/DialogWithIrreversibleAction';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../../ui-atoms/Table';
import PatchTemplateEditorDrawer from '../../../../drawers/PatchTemplateEditorDrawer';

export default function PatchesCollectionPage(): ReactElement {
  const handleError = useHandleError();

  const collection = useCollection();
  const patchNames = useCollectionPatchNames(collection);

  const [nameToDelete, setNameToDelete] = useState<string | undefined>();
  const deletePatch = useDeletePatchFromCollection(collection);
  const handleDelete = useAsyncCallback(async () => {
    if (nameToDelete) {
      const error = await deletePatch(nameToDelete);
      handleError(error, 'Failed to delete patch');
      return error;
    }
  }, [handleError, nameToDelete, deletePatch]);

  const [nameToEdit, setNameToEdit] = useState<string | undefined>();
  const editPatch = useEditPatchInCollection(collection);
  const handleEdit = useAsyncCallback(
    async (name: string) => {
      if (nameToEdit) {
        const error = await editPatch(nameToEdit, name);
        handleError(error, 'Failed to edit patch');
        return error;
      }
    },
    [handleError, nameToEdit, editPatch],
  );

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

  const rows: TableRow<string>[] = useList(patchNames).map((patchName) => ({
    data: patchName,
    key: patchName,
  }));

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
        <PatchTemplateEditorDrawer
          name={nameToEdit}
          onClose={() => setNameToEdit(undefined)}
          onEdit={handleEdit.call}
        />
      )}
    </>
  );
}
