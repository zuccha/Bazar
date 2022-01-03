import { Flex, Text, VStack } from '@chakra-ui/react';
import * as Tauri from '@tauri-apps/api';
import { ReactElement } from 'react';

export interface OutputParagraph {
  text: string;
  type: 'plain' | 'failure' | 'success' | 'info';
  isBold?: boolean;
}

export type OutputChunk = OutputParagraph[];

export const chunksToString = (chunks: OutputChunk[]): string => {
  return chunks
    .map((chunk) => chunk.map((paragraph) => paragraph.text))
    .map((paragraph) => paragraph.join(Tauri.os.EOL))
    .join(`${Tauri.os.EOL}${Tauri.os.EOL}`);
};

interface OutputProps {
  chunks: OutputChunk[];

  flex?: number;
  height?: number | string;
  width?: number | string;
  overflow?: 'auto' | 'hidden' | 'scroll' | 'visible';
}

const colorByParagraphType = {
  plain: 'gray.200',
  failure: 'red.400',
  success: 'green.400',
  info: 'blue.400',
};

export default function Output({
  chunks,
  flex,
  height,
  width,
  overflow,
}: OutputProps): ReactElement {
  return (
    <VStack
      flex={flex}
      height={height}
      width={width}
      overflow={overflow}
      p={4}
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
  );
}
