import { CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { Flex, HStack, Text, useToast, VStack } from '@chakra-ui/react';
import * as Tauri from '@tauri-apps/api';
import { ReactElement } from 'react';
import useAsyncCallback from '../../hooks/useAsyncCallback';
import useHandleError from '../../hooks/useHandleError';
import { $ErrorReport, ErrorReport } from '../../utils/ErrorReport';
import IconButton from '../input/IconButton';

export interface OutputParagraph {
  text: string;
  type: 'plain' | 'failure' | 'success' | 'info';
  isBold?: boolean;
}

export type OutputChunk = OutputParagraph[];

interface OutputProps {
  chunks: OutputChunk[];
  onClear: () => void;

  flex?: number;
  height?: number | string;
  width?: number | string;
}

const colorByParagraphType = {
  plain: 'gray.200',
  failure: 'red.400',
  success: 'green.400',
  info: 'blue.400',
};

export default function Output({
  chunks,
  onClear,
  flex,
  height,
  width,
}: OutputProps): ReactElement {
  const handleError = useHandleError();
  const toast = useToast();

  const handleCopyToClipboard = useAsyncCallback(async (): Promise<
    ErrorReport | undefined
  > => {
    try {
      const text = chunks
        .map((chunk) =>
          chunk.map((paragraph) => paragraph.text).join(Tauri.os.EOL),
        )
        .join(`${Tauri.os.EOL}${Tauri.os.EOL}`);
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
    <Flex
      flexDir='column'
      height={height}
      width={width}
      flex={flex}
      overflow='hidden'
    >
      <Flex
        h={50}
        alignItems='center'
        justifyContent='space-between'
        bg={'gray.200'}
        borderColor={'gray.300'}
        borderWidth='1px'
        px={5}
        py={2}
      >
        <Text textTransform='uppercase' fontWeight='bold' fontSize='xs'>
          Output
        </Text>
        <HStack spacing={3}>
          <IconButton
            icon={<CopyIcon />}
            isDisabled={chunks.length === 0 || handleCopyToClipboard.isLoading}
            label='Copy'
            onClick={handleCopyToClipboard.call}
            size='xs'
            variant='ghost'
          />
          <IconButton
            icon={<DeleteIcon />}
            isDisabled={chunks.length === 0}
            label='Clear'
            onClick={onClear}
            size='xs'
            variant='ghost'
          />
        </HStack>
      </Flex>

      <VStack
        flex={1}
        p={4}
        overflow='auto'
        bg='gray.700'
        alignItems='flex-start'
        spacing={6}
        divider={<Flex w='100%' h='1px' bg={colorByParagraphType.plain} />}
      >
        {chunks.map((chunk, chunkIndex) => (
          <VStack key={chunkIndex} alignItems='flex-start' spacing={1}>
            {chunk.map((paragraph, paragraphIndex) => (
              <VStack
                key={`${chunkIndex}-${paragraphIndex}`}
                alignItems='flex-start'
              >
                {paragraph.text.split(Tauri.os.EOL).map((line, lineIndex) => (
                  <Text
                    key={`${chunkIndex}-${paragraphIndex}-${lineIndex}`}
                    color={colorByParagraphType[paragraph.type]}
                    fontWeight={paragraph.isBold ? 'bold' : undefined}
                  >
                    {line}
                  </Text>
                ))}
              </VStack>
            ))}
          </VStack>
        ))}
      </VStack>
    </Flex>
  );
}
