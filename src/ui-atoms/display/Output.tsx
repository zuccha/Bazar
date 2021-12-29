import * as Chakra from '@chakra-ui/react';
import { ReactElement } from 'react';

export interface OutputChunk {
  text: string;
  type: 'plain' | 'failure' | 'success';
  isBold?: boolean;
}

interface OutputProps {
  chunks: OutputChunk[];
}

const colorByChunkType = {
  plain: 'gray.200',
  failure: 'red.400',
  success: 'green.400',
};

export default function Output({ chunks }: OutputProps): ReactElement {
  return (
    <Chakra.Table flex={1} h='100%' display='flex' flexDirection='column'>
      <Chakra.Thead
        display='flex'
        borderColor='app.bg1'
        borderWidth={1}
        borderBottomWidth={0}
      >
        <Chakra.Tr flex={1} bg='app.bg2'>
          <Chakra.Th borderColor='app.bg1'>Output</Chakra.Th>
        </Chakra.Tr>
      </Chakra.Thead>
      <Chakra.Tbody
        display='flex'
        flexDirection='column'
        h='100%'
        bg='gray.700'
        overflowY='auto'
      >
        {chunks.map((chunk, index) => (
          <Chakra.Tr key={index} borderColor='gray.700' borderWidth={1}>
            <Chakra.Td verticalAlign={'top'} borderWidth={0}>
              {chunk.text.split('\n').map((line) => (
                <Chakra.Text
                  key={line}
                  color={colorByChunkType[chunk.type]}
                  fontWeight={chunk.isBold ? 'bold' : 'normal'}
                  mb={1}
                >
                  {line}
                </Chakra.Text>
              ))}
            </Chakra.Td>
          </Chakra.Tr>
        ))}
      </Chakra.Tbody>
    </Chakra.Table>
  );
}
