import { HStack, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Patch from '../../../../../../core/Patch';
import Button from '../../../../../../ui-atoms/input/Button';
import TextInput from '../../../../../../ui-atoms/input/TextInput';

interface PatchesTabInfoProps {
  patch: Patch | undefined;
}

export default function PatchesTabInfo({
  patch,
}: PatchesTabInfoProps): ReactElement {
  return (
    <VStack spacing={2} flex={1}>
      <HStack w='100%'>
        <TextInput
          isDisabled={!patch}
          onChange={() => {}}
          placeholder='Name'
          value={patch ? patch.getInfo().name : ''}
        />
        <TextInput
          isDisabled={!patch}
          onChange={() => {}}
          placeholder='Version'
          value={''}
          width={'150px'}
        />
      </HStack>
      <TextInput
        isDisabled={!patch}
        onChange={() => {}}
        placeholder='Author(s)'
        value={''}
      />
      <HStack w='100%' justifyContent='flex-end'>
        <Button
          isDisabled={!patch}
          label='Reset'
          onClick={() => {}}
          variant='outline'
        />
        <Button isDisabled={!patch} label='Save' onClick={() => {}} />
      </HStack>
    </VStack>
  );
}
