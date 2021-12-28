import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useCore } from './contexts/CoreContext';
import { useSettings, useToolchain } from './core-hooks/Core';
import { useLoadSettings } from './core-hooks/Settings';
import { useLoadToolchain } from './core-hooks/Toolchain';
import Navigator from './ui/Navigator';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const core = useCore();

  const settings = useSettings();
  const loadSettings = useLoadSettings(settings);

  const toolchain = useToolchain();
  const loadToolchain = useLoadToolchain(toolchain);

  useEffect(() => {
    Promise.all([loadSettings(), loadToolchain()]).then((responses) => {
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
