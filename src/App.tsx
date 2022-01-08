import { Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useLoadCollection } from './core-hooks/Collection';
import { useCollection, useSettings, useToolchain } from './core-hooks/Core';
import { useLoadSettings } from './core-hooks/Settings';
import { useLoadToolchain } from './core-hooks/Toolchain';
import useEffectAsync from './hooks/useEffectAsync';
import useToast from './hooks/useToast';
import Navigator from './ui/Navigator';

const errorTitles = ['Failed to load settings', 'Failed to load tools'];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const collection = useCollection();
  const loadCollection = useLoadCollection(collection);

  const settings = useSettings();
  const loadSettings = useLoadSettings(settings);

  const toolchain = useToolchain();
  const loadToolchain = useLoadToolchain(toolchain);

  const toast = useToast();

  useEffectAsync(async () => {
    const errors = await Promise.all([loadSettings(), loadToolchain()]);
    errors.forEach((error, index) => {
      if (error) toast.failure(errorTitles[index] || 'Failed to load', error);
    });

    if (errors.every((error) => !error)) {
      const error = await loadCollection();
      if (error) toast.failure('Failed to load collection', error);
    }

    setIsLoading(false);
  }, []);

  return isLoading ? (
    <Flex h='100%' w='100%' alignItems='center' justifyContent='center'>
      Loading...
    </Flex>
  ) : (
    <Navigator />
  );
}
