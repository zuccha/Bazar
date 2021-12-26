import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCore } from './contexts/CoreContext';
import Core from './core/Core';
import Settings from './core/Settings';
import Toolchain from './core/Toolchain';
import { useGet, useSetAsync } from './hooks/useAccessors';
import { AppDispatch } from './store';
import Navigation from './ui/Navigation';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const core = useCore();

  const settings = useGet(core, core.getSettings, Core.getSettingsDeps);
  const loadSettings = useSetAsync(
    settings,
    settings.load,
    Settings.loadTriggers,
  );

  const toolchain = useGet(core, core.getToolchain, Core.getToolchainDeps);
  const loadToolchain = useSetAsync(
    toolchain,
    toolchain.load,
    Toolchain.loadTriggers,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    Promise.all([loadSettings(), loadToolchain()]).then((responses) => {
      setIsLoading(false);
    });
  }, [dispatch]);

  return isLoading ? (
    <Flex h='100%' w='100%' alignItems='center' justifyContent='center'>
      Loading...
    </Flex>
  ) : (
    <Navigation />
  );
}
