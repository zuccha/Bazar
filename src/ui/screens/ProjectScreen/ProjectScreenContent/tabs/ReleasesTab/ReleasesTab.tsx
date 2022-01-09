import { DeleteIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ReactElement, useMemo, useState } from 'react';
import {
  useDeleteProjectRelease,
  useProjectReleases,
} from '../../../../../../core-hooks/Project';
import Project from '../../../../../../core/Project';
import Release from '../../../../../../core/Release';
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

interface ReleasesTabProps {
  project: Project;
}

export default function ReleasesTab({
  project,
}: ReleasesTabProps): ReactElement {
  const releases = useProjectReleases(project);
  const deleteRelease = useDeleteProjectRelease(project);

  const [releaseToDelete, setReleaseToDelete] = useState<Release | undefined>();

  const toast = useToast();

  const handleDeleteRelease = useAsyncCallback(async () => {
    if (releaseToDelete) {
      const error = await deleteRelease(releaseToDelete);
      if (error) toast.failure('Failed to delete release', error);
      return error;
    }
  }, [releaseToDelete, toast]);

  const isLoading = handleDeleteRelease.isLoading;

  const actions: TableAction<Release>[] = useMemo(() => {
    return [
      {
        icon: <DeleteIcon />,
        isDisabled: isLoading,
        label: `Remove backup`,
        onClick: (row) => setReleaseToDelete(row.data),
      },
    ];
  }, [isLoading]);

  const columns: TableColumn<Release>[] = useMemo(() => {
    return [
      {
        key: 'name',
        label: 'Name',
        getValue: (row) => row.data.getInfo().name,
        width: 'fill',
      },
      {
        key: 'version',
        label: 'Version',
        getValue: (row) => row.data.getInfo().version,
        width: '200px',
      },
      {
        key: 'date',
        label: 'Creation date',
        getValue: (row) =>
          $DateTime.formatDate(
            row.data.getInfo().creationDate,
            DateTimeFormat.NumericLong,
          ),
        width: '350px',
      },
    ];
  }, []);

  const rows: TableRow<Release>[] = useList(releases).map((release) => ({
    data: release,
    key: release.getId(),
  }));

  return (
    <>
      <Flex flex={1} minW={512} maxW={1024}>
        <Table
          actions={actions}
          columns={columns}
          rows={rows}
          flex={1}
          width='100%'
        />
      </Flex>

      {!!releaseToDelete && (
        <DialogWithIrreversibleAction
          action='Delete'
          isDisabled={handleDeleteRelease.isLoading}
          onClose={() => setReleaseToDelete(undefined)}
          onDelete={handleDeleteRelease.call}
          title={`Delete backup`}
        />
      )}
    </>
  );
}
