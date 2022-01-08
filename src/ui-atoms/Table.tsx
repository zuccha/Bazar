import { Center, Flex, HStack, Text } from '@chakra-ui/react';
import { ReactElement, useMemo } from 'react';
import useColorScheme from '../theme/useColorScheme';
import IconButton from './IconButton';

export interface TableRow<T> {
  key: string;
  data: T;
}

export interface TableColumn<T> {
  key: string;
  label: string;

  getValue: (row: TableRow<T>) => string | number | boolean;

  width: 'fill' | `${number}px`;
}

export interface TableAction<T> {
  icon: ReactElement;
  isDisabled?: boolean;
  label: string;
  onClick: (row: TableRow<T>) => unknown;
}

export interface TableHeaderAction {
  icon: ReactElement;
  isDisabled?: boolean;
  label: string;
  onClick: () => unknown;
}

interface TableProps<T> {
  actions?: TableAction<T>[];
  headerActions?: TableHeaderAction[];
  columns: TableColumn<T>[];
  rows: TableRow<T>[];

  selectedRowIndex?: number | undefined;
  onSelectRowIndex?: (index: number) => void;

  variant?: 'solid' | 'minimal';

  flex?: number;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
}

function computeColumnStyle<T>(
  column: TableColumn<T>,
): undefined | { flexGrow: number } | { width: string | number } {
  return column.width === 'fill' ? { flexGrow: 1 } : { width: column.width };
}

const stylesByVariant = {
  solid: {
    border: {
      borderColor: 'gray.300',
      borderWidth: '1px',
    },
    header: {
      bg: 'app.bg2',
    },
    row: {
      borderColor: 'gray.300',
      borderBottomWidth: '1px',
      px: 5,
      py: 2,
    },
  },
  minimal: {
    border: {},
    header: {},
    row: {
      borderColor: 'gray.300',
      borderBottomWidth: '1px',
      px: 5,
      py: 2,
    },
  },
};

export default function Table<T>({
  actions = [],
  headerActions = [],
  columns,
  rows,

  selectedRowIndex,
  onSelectRowIndex,

  variant = 'solid',

  flex,
  height,
  width,
  minHeight,
  minWidth,
}: TableProps<T>): ReactElement {
  const colorScheme = useColorScheme();

  const columnStyles = useMemo(() => {
    return columns.map(computeColumnStyle);
  }, [columns]);

  const styles = stylesByVariant[variant];

  return (
    <Flex
      flexDir='column'
      height={height}
      width={width}
      minHeight={minHeight}
      minWidth={minWidth}
      flex={flex}
      {...styles.border}
      overflow='hidden'
    >
      <Flex {...styles.header} h={50} position='relative'>
        {columns.map((column, columnIndex) => (
          <Flex
            key={column.key}
            alignItems='center'
            {...columnStyles[columnIndex]}
            {...styles.row}
          >
            <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
              {column.label}
            </Text>
          </Flex>
        ))}
        {headerActions.length > 0 && (
          <HStack spacing={1} position='absolute' h='100%' right={4}>
            {headerActions.map((action) => (
              <IconButton
                icon={action.icon}
                isDisabled={action.isDisabled}
                key={action.label}
                label={action.label}
                onClick={action.onClick}
                size='sm'
                variant='ghost'
              />
            ))}
          </HStack>
        )}
      </Flex>

      <Flex flex={1} pb={2} flexDir='column' overflow='auto'>
        {rows.length === 0 && (
          <Center flex={1}>
            <Text size='sm' fontStyle='italic'>
              No items
            </Text>
          </Center>
        )}
        {rows.map((row, rowIndex) => {
          return (
            <Flex
              key={row.key}
              h={45}
              role='group'
              bg={
                selectedRowIndex === rowIndex ? `${colorScheme}.100` : undefined
              }
              _hover={{
                backgroundColor: 'app.bg2',
                cursor: onSelectRowIndex ? 'pointer' : undefined,
              }}
              onClick={() => onSelectRowIndex?.(rowIndex)}
              position='relative'
            >
              {columns.map((column, columnIndex) => (
                <Flex
                  key={`${row.key}-${column.key}`}
                  alignItems='center'
                  {...columnStyles[columnIndex]}
                  {...styles.row}
                >
                  <Text fontSize='md'>{column.getValue(row)}</Text>
                </Flex>
              ))}
              {actions.length > 0 && (
                <Flex position='absolute' h='100%' right={4}>
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
                </Flex>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
