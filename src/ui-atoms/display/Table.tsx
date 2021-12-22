import * as Chakra from '@chakra-ui/react';
import { ReactElement } from 'react';
import useColorScheme from '../../theme/useColorScheme';
import IconButton from '../input/IconButton';

interface TableProps<T> {
  actions?: readonly {
    readonly icon: ReactElement;
    readonly onClick: (item: T) => void;
    readonly tooltip: string;
  }[];
  columns: readonly {
    readonly name: string;
    readonly key: keyof T;
  }[];
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
          <Chakra.Tr bg='app.bg2'>
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
                  key={`${getItemKey(item)}-${item[column.key]}`}
                  borderColor='app.bg1'
                >
                  {item[column.key]}
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
                        key={`${getItemKey(item)}-${action.tooltip}`}
                        icon={action.icon}
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
