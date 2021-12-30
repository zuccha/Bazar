import * as Chakra from '@chakra-ui/react';
import { ReactElement, ReactNode } from 'react';
import useColorScheme from '../../theme/useColorScheme';
import IconButton from '../input/IconButton';

interface ColumnKey<T> {
  readonly name: string;
  readonly key: keyof T;
}

interface ColumnRender<T> {
  readonly name: string;
  readonly render: (item: T) => ReactNode;
}

function isColumnKey<T>(maybeColumnKey: {
  name: string;
}): maybeColumnKey is ColumnKey<T> {
  return 'key' in maybeColumnKey;
}

function isColumnRender<T>(maybeColumnRender: {
  name: string;
}): maybeColumnRender is ColumnRender<T> {
  return 'render' in maybeColumnRender;
}

interface TableProps<T> {
  actions?: readonly {
    readonly icon: ReactElement;
    readonly isDisabled?: boolean;
    readonly onClick: (item: T) => void;
    readonly tooltip: string;
  }[];
  columns: readonly (ColumnKey<T> | ColumnRender<T>)[];
  getItemKey: (item: T) => string;
  items: T[];
  onSelectItem?: (item: T, index: number) => void;
  selectedItemIndex?: number;
}

export default function Table<T>({
  actions = [],
  columns,
  getItemKey,
  items,
  onSelectItem,
  selectedItemIndex,
}: TableProps<T>): ReactElement {
  const colorScheme = useColorScheme();
  return (
    <Chakra.Box flex={1} overflowY='auto'>
      <Chakra.Table colorScheme={colorScheme} flex={1} overflowY='auto'>
        <Chakra.Thead>
          <Chakra.Tr bg='app.bg2' h='49px'>
            {columns.map((column) => (
              <Chakra.Th key={column.name} borderColor='app.bg1'>
                {column.name}
              </Chakra.Th>
            ))}
            {actions.length > 0 && <Chakra.Th borderColor='app.bg1' />}
          </Chakra.Tr>
        </Chakra.Thead>
        <Chakra.Tbody>
          {items.map((item, index) => (
            <Chakra.Tr
              key={getItemKey(item)}
              role='group'
              onClick={() => {
                onSelectItem?.(item, index);
              }}
              backgroundColor={
                selectedItemIndex === index
                  ? `${colorScheme}.100`
                  : 'transparent'
              }
              _hover={{
                backgroundColor: 'app.bg2',
                cursor: onSelectItem ? 'pointer' : undefined,
              }}
            >
              {columns.map((column) => (
                <Chakra.Td
                  key={`${getItemKey(item)}-${column.name}`}
                  borderColor='app.bg1'
                >
                  {isColumnKey(column) && item[column.key]}
                  {isColumnRender(column) && column.render(item)}
                </Chakra.Td>
              ))}
              {actions.length > 0 && (
                <Chakra.Td borderColor='app.bg1' w={1}>
                  <Chakra.HStack
                    visibility='hidden'
                    _groupHover={{ visibility: 'visible' }}
                  >
                    {actions.map((action) => (
                      <IconButton
                        icon={action.icon}
                        isDisabled={action.isDisabled}
                        key={`${getItemKey(item)}-${action.tooltip}`}
                        label={action.tooltip}
                        onClick={() => action.onClick(item)}
                        size='sm'
                        variant='ghost'
                      />
                    ))}
                  </Chakra.HStack>
                </Chakra.Td>
              )}
            </Chakra.Tr>
          ))}
        </Chakra.Tbody>
      </Chakra.Table>
    </Chakra.Box>
  );
}
