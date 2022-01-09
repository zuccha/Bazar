import { CheckIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Button from '../../../../../ui-atoms/Button';

interface AssetItemProps {
  name: string;
  description: string;
  isSetup: boolean;
  onSetup: () => void;
}

export default function AssetItem({
  name,
  description,
  isSetup,
  onSetup,
}: AssetItemProps): ReactElement {
  return (
    <Flex w='100%'>
      <Flex flex={1} flexDir='column'>
        <Heading size='sm' flex={1} display='flex'>
          <Text>{name}&nbsp;</Text>
          {isSetup && <CheckIcon color='green' />}
          {!isSetup && <SmallCloseIcon color='red' />}
        </Heading>
        <Text mt={1}>{description}</Text>
      </Flex>
      <Flex w={90}>
        <Button
          label='Setup'
          onClick={onSetup}
          size='xs'
          variant='outline'
          w='100%'
        />
      </Flex>
    </Flex>
  );
}
