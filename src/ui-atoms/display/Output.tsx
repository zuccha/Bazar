import * as Chakra from '@chakra-ui/react';
import { ReactElement } from 'react';

interface OutputProps {
  output: string;
}

export default function Output({ output }: OutputProps): ReactElement {
  return (
    <Chakra.Table flex={1} h='100%' display='flex' flexDirection='column'>
      <Chakra.Thead
        w='100%'
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
        bg='black'
        color='white'
        overflowY='auto'
      >
        <Chakra.Tr borderColor='black' borderWidth={1}>
          <Chakra.Td verticalAlign={'top'} borderWidth={0}>
            {output.split('\n').map((line) => (
              <Chakra.Text key={line}>{line}</Chakra.Text>
            ))}
          </Chakra.Td>
        </Chakra.Tr>
      </Chakra.Tbody>
    </Chakra.Table>
  );
}
