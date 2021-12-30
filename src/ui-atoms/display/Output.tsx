import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import * as Chakra from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import * as Tauri from '@tauri-apps/api';
import { ReactElement, useCallback } from 'react';
import useAsyncCallback from '../../hooks/useAsyncCallback';
import useHandleError from '../../hooks/useHandleError';
import { $ErrorReport, ErrorReport } from '../../utils/ErrorReport';
import IconButton from '../input/IconButton';

export interface OutputChunk {
  text: string;
  type: 'plain' | 'failure' | 'success';
}

interface OutputProps {
  chunks: OutputChunk[];
  onClear: () => void;
}

const colorByChunkType = {
  plain: 'gray.200',
  failure: 'red.400',
  success: 'green.400',
};

export default function Output({ chunks, onClear }: OutputProps): ReactElement {
  const handleError = useHandleError();
  const toast = useToast();

  const handleCopyToClipboard = useAsyncCallback(async (): Promise<
    ErrorReport | undefined
  > => {
    try {
      const text = chunks.map((chunk) => chunk.text).join('\n');
      await Tauri.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'The output has been copied to your clipboard',
        status: 'success',
      });
    } catch {
      const error = $ErrorReport.make('Failed to copy to clipboard');
      handleError(error, 'Please, try again');
      return error;
    }
  }, [chunks, handleError, toast]);

  return (
    <Chakra.Table flex={1} h='100%' display='flex' flexDirection='column'>
      <Chakra.Thead display='flex'>
        <Chakra.Tr
          flex={1}
          bg='app.bg2'
          borderColor='app.bg1'
          borderWidth={1}
          borderBottomWidth={0}
        >
          <Chakra.Th borderColor='app.bg1' display='flex'>
            <Chakra.Flex alignItems='center' flex={1}>
              <Chakra.Text flex={1}>Output</Chakra.Text>
              <Chakra.Flex>
                <IconButton
                  icon={<CopyIcon />}
                  isDisabled={
                    chunks.length === 0 || handleCopyToClipboard.isLoading
                  }
                  label='Copy'
                  onClick={handleCopyToClipboard.call}
                  size='xs'
                  variant='ghost'
                />
                <Chakra.Box w={3} />
                <IconButton
                  icon={<DeleteIcon />}
                  isDisabled={chunks.length === 0}
                  label='Clear'
                  onClick={onClear}
                  size='xs'
                  variant='ghost'
                />
              </Chakra.Flex>
            </Chakra.Flex>
          </Chakra.Th>
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
                <Chakra.Text key={line} color={colorByChunkType[chunk.type]}>
                  {line}
                </Chakra.Text>
              ))}
            </Chakra.Td>
          </Chakra.Tr>
        ))}
        {chunks.length > 0 &&
          (chunks.some((chunk) => chunk.type === 'failure') ? (
            <Chakra.Tr borderColor='gray.700' borderWidth={1}>
              <Chakra.Td verticalAlign={'top'} borderWidth={0}>
                <Chakra.Text color={colorByChunkType.failure} fontWeight='bold'>
                  {'An error occurred!'}
                </Chakra.Text>
              </Chakra.Td>
            </Chakra.Tr>
          ) : (
            <Chakra.Tr borderColor='gray.700' borderWidth={1}>
              <Chakra.Td verticalAlign={'top'} borderWidth={0}>
                <Chakra.Text color={colorByChunkType.success} fontWeight='bold'>
                  {'Process completed successfully!'}
                </Chakra.Text>
              </Chakra.Td>
            </Chakra.Tr>
          ))}
      </Chakra.Tbody>
    </Chakra.Table>
  );
}
