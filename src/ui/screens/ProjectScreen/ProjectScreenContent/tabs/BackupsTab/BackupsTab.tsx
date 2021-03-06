import { ArrowForwardIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ReactElement, useMemo, useState } from 'react';
import {
  useDeleteProjectBackup,
  useProjectBackups,
  useRestoreProjectBackup,
} from '../../../../../../core-hooks/Project';
import Project from '../../../../../../core/Project';
import { useList } from '../../../../../../hooks/useAccessors';
import useAsyncCallback from '../../../../../../hooks/useAsyncCallback';
import useToast from '../../../../../../hooks/useToast';
import DialogWithIrreversibleAction from '../../../../../../ui-atoms/DialogWithIrreversibleAction';
import Table, {
  TableAction,
  TableColumn,
  TableRow,
} from '../../../../../../ui-atoms/Table';
import { $DateTime, DateTimeFormat } from '../../../../../../utils/DateTime';

interface BackupsTabProps {
  project: Project;
}

export default function BackupsTab({ project }: BackupsTabProps): ReactElement {
  const backups = useProjectBackups(project);
  const deleteBackup = useDeleteProjectBackup(project);
  const restoreBackup = useRestoreProjectBackup(project);

  const [backupToDelete, setBackupToDelete] = useState<string | undefined>();
  const [backupToRestore, setBackupToRestore] = useState<string | undefined>();

  const toast = useToast();

  const handleDeleteBackup = useAsyncCallback(async () => {
    if (backupToDelete) {
      const error = await deleteBackup(backupToDelete);
      if (error) toast.failure('Failed to delete backup', error);
      return error;
    }
  }, [backupToDelete, toast]);

  const handleRestoreBackup = useAsyncCallback(async () => {
    if (backupToRestore) {
      const error = await restoreBackup(backupToRestore);
      toast('Backup restored successfully', 'Failed to restore backup', error);
      return error;
    }
  }, [backupToRestore, toast]);

  const isLoading =
    handleDeleteBackup.isLoading || handleRestoreBackup.isLoading;

  const actions: TableAction<string>[] = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: isLoading,
        label: `Restore backup`,
        onClick: (row) => setBackupToRestore(row.data),
      },
      {
        icon: <DeleteIcon />,
        isDisabled: isLoading,
        label: `Remove backup`,
        onClick: (row) => setBackupToDelete(row.data),
      },
    ];
  }, [isLoading]);

  const columns: TableColumn<string>[] = useMemo(() => {
    return [
      {
        key: 'date',
        label: 'Creation date',
        getValue: (row) =>
          $DateTime.formatTimestamp(row.data, DateTimeFormat.NumericLong),
        width: 'fill',
      },
    ];
  }, []);

  const rows: TableRow<string>[] = useList(backups).map((backup) => ({
    data: backup,
    key: backup,
  }));

  return (
    <>
      <Flex flex={1} w={512}>
        <Table
          actions={actions}
          columns={columns}
          rows={rows}
          flex={1}
          width='100%'
        />
      </Flex>
      {!!backupToDelete && (
        <DialogWithIrreversibleAction
          action='Delete'
          isDisabled={handleDeleteBackup.isLoading}
          onClose={() => setBackupToDelete(undefined)}
          onDelete={handleDeleteBackup.call}
          title={`Delete backup`}
        />
      )}
      {!!backupToRestore && (
        <DialogWithIrreversibleAction
          action='Restore'
          description="Are you sure? This will overwrite your current project and can't be undone."
          isDisabled={handleRestoreBackup.isLoading}
          onClose={() => setBackupToRestore(undefined)}
          onDelete={handleRestoreBackup.call}
          title={`Restore backup`}
        />
      )}
    </>
  );
}
