import { Center, Flex, HStack, Text } from '@chakra-ui/react';
import { ReactElement, useMemo } from 'react';
import IconButton from '../input/IconButton';

export interface TableRow<T> {
  key: string;
  data: T;
}

export interface TableColumn<T> {
  key: string;
  label: string;

  getValue: (row: TableRow<T>) => string | number | boolean;

  isSortable?: boolean;
  isEditable?: boolean;

  width: 'fill' | `${number}px`;
}

export interface TableAction<T> {
  icon: ReactElement;
  isDisabled?: boolean;
  label: string;
  onClick: (row: TableRow<T>) => unknown;
}

interface TableProps<T> {
  actions: TableAction<T>[];
  columns: TableColumn<T>[];
  rows: TableRow<T>[];

  flex?: number;
  height?: number | string;
  width?: number | string;
}

function computeColumnStyle<T>(
  column: TableColumn<T>,
): undefined | { flexGrow: number } | { width: string | number } {
  return column.width === 'fill' ? { flexGrow: 1 } : { width: column.width };
}

const borderStyle = {
  borderColor: 'gray.300',
  borderWidth: '1px',
};

const rowStyle = {
  borderColor: 'gray.300',
  borderBottomWidth: '1px',
  px: 5,
  py: 2,
};

export default function Table<T>({
  actions,
  columns,
  rows,

  flex,
  height,
  width,
}: TableProps<T>): ReactElement {
  const columnStyles = useMemo(() => {
    return columns.map(computeColumnStyle);
  }, [columns]);

  return (
    <Flex
      flexDir='column'
      height={height}
      width={width}
      flex={flex}
      {...borderStyle}
      overflow='hidden'
    >
      <Flex h={50} bg='gray.200'>
        {columns.map((column, columnIndex) => (
          <Flex
            key={column.key}
            alignItems='center'
            {...columnStyles[columnIndex]}
            {...rowStyle}
          >
            <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
              {column.label}
            </Text>
          </Flex>
        ))}
        {actions.length > 0 && <Flex width='120px' {...rowStyle} />}
      </Flex>

      <Flex flex={1} pb={2} flexDir='column' overflow='auto'>
        {rows.map((row) => {
          return (
            <Flex
              key={row.key}
              h={45}
              role='group'
              _hover={{
                backgroundColor: 'app.bg2',
              }}
            >
              {columns.map((column, columnIndex) => (
                <Flex
                  key={`${row.key}-${column.key}`}
                  alignItems='center'
                  {...columnStyles[columnIndex]}
                  {...rowStyle}
                >
                  <Text fontSize='md'>{column.getValue(row)}</Text>
                </Flex>
              ))}
              {actions.length > 0 && (
                <Center {...rowStyle} width='120px'>
                  <HStack
                    spacing={1}
                    visibility='hidden'
                    _groupHover={{ visibility: 'visible' }}
                  >
                    {actions.map((action) => (
                      <IconButton
                        icon={action.icon}
                        isDisabled={action.isDisabled}
                        key={`${row.key}-${action.label}`}
                        label={action.label}
                        onClick={() => action.onClick(row)}
                        size='sm'
                        variant='ghost'
                      />
                    ))}
                  </HStack>
                </Center>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
