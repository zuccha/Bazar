import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useCore } from './contexts/CoreContext';
import { useLoadCollection } from './core-hooks/Collection';
import { useCollection, useSettings, useToolchain } from './core-hooks/Core';
import { useLoadSettings } from './core-hooks/Settings';
import { useLoadToolchain } from './core-hooks/Toolchain';
import useEffectAsync from './hooks/useEffectAsync';
import useHandleError from './hooks/useHandleError';
import Navigator from './ui/Navigator';
import { $FileSystem } from './utils/FileSystem';

const errorTitles = ['Failed to load settings', 'Failed to load tools'];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const collection = useCollection();
  const loadCollection = useLoadCollection(collection);

  const settings = useSettings();
  const loadSettings = useLoadSettings(settings);

  const toolchain = useToolchain();
  const loadToolchain = useLoadToolchain(toolchain);

  const handleError = useHandleError();

  useEffectAsync(async () => {
    const maybeErrors = await Promise.all([loadSettings(), loadToolchain()]);
    maybeErrors.forEach((maybeError, index) =>
      handleError(maybeError, errorTitles[index] || 'Failed to load'),
    );

    if (maybeErrors.every((maybeError) => !maybeError)) {
      const maybeError = await loadCollection();
      handleError(maybeError, 'Failed to load collection');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    Promise.all([loadSettings(), loadToolchain()]).then((maybeErrors) => {
      maybeErrors.forEach((maybeError, index) =>
        handleError(maybeError, errorTitles[index] || 'Failed to load'),
      ),
        setIsLoading(false);
    });
  }, [loadSettings, loadToolchain]);

  return isLoading ? (
    <Flex h='100%' w='100%' alignItems='center' justifyContent='center'>
      Loading...
    </Flex>
  ) : (
    <Navigator />
  );
}
