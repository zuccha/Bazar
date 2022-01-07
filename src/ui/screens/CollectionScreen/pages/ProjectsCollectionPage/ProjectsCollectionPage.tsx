import { ReactElement, useMemo } from 'react';
import { useCollectionProjectSnapshotNames } from '../../../../../core-hooks/Collection';
import { useCollection } from '../../../../../core-hooks/Core';
import { useList } from '../../../../../hooks/useAccessors';
import Table, { TableColumn, TableRow } from '../../../../../ui-atoms/Table';

export default function ProjectsCollectionPage(): ReactElement {
  const collection = useCollection();
  const projectSnapshotNames = useCollectionProjectSnapshotNames(collection);

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
    <Table
      actions={[]}
      columns={columns}
      rows={rows}
      variant='minimal'
      flex={1}
    />
  );
}
