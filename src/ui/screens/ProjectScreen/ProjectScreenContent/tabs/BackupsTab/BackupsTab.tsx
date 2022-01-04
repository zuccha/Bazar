import { ArrowForwardIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useProjectBackups } from '../../../../../../core-hooks/Project';
import Project from '../../../../../../core/Project';
import { useGet } from '../../../../../../hooks/useAccessors';
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

  const [backupToRestore, setBackupToRestore] = useState<string | undefined>();
  const [backupToRemove, setBackupToRemove] = useState<string | undefined>();

  const actions: TableAction<string>[] = useMemo(() => {
    return [
      {
        icon: <ArrowForwardIcon />,
        isDisabled: true,
        label: `Restore backup`,
        onClick: (row) => setBackupToRestore(row.data),
      },
      {
        icon: <DeleteIcon />,
        isDisabled: true,
        label: `Remove backup`,
        onClick: (row) => setBackupToRemove(row.data),
      },
    ];
  }, []);

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

  const rows: TableRow<string>[] = useGet(
    project,
    useCallback(() => {
      return backups.map((backup) => ({
        data: backup,
        key: backup,
      }));
    }, [backups]),
    Project.getBackupsDeps,
  );

  return (
    <Flex flex={1} w={512}>
      <Table
        actions={actions}
        columns={columns}
        rows={rows}
        flex={1}
        width='100%'
      />
    </Flex>
  );
}
