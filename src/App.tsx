import { Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCore } from './contexts/CoreContext';
import Core from './core2/Core';
import Toolchain from './core2/Toolchain';
import { useGet, useSetAsync } from './hooks/useAccessors';
import { AppDispatch } from './store';
import { loadToolchain } from './store/slices/core/slices/toolchain';
import { loadSettings } from './store/slices/settings';
import Navigation from './ui/Navigation';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const core = useCore();
  const toolchain = useGet(core, core.getToolchain, Core.getToolchainDeps);
  const loadToolchain = useSetAsync(
    toolchain,
    toolchain.load,
    Toolchain.loadTriggers,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    Promise.all([dispatch(loadSettings()), loadToolchain()]).then(
      (responses) => {
        setIsLoading(false);
      },
    );
  }, [dispatch]);

  return isLoading ? (
    <Flex h='100%' w='100%' alignItems='center' justifyContent='center'>
      Loading...
    </Flex>
  ) : (
    <Navigation />
  );
}
