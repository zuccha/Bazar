import { LayoutProps, SpaceProps } from '@chakra-ui/react';
import { ReactElement, useEffect, useState } from 'react';
import useAsyncCallback from '../hooks/useAsyncCallback';
import useEffectAsync from '../hooks/useEffectAsync';
import { $FileSystem } from '../utils/FileSystem';
import Selector, { SelectorOption } from './Selector';

interface SelectorOfFilesProps extends LayoutProps, SpaceProps {
  directoryPath: string;
  extensions?: string[];
  isDisabled?: boolean;
  isFullWidth?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export default function SelectorOfFiles({
  directoryPath,
  extensions = [],
  isDisabled,
  isFullWidth,
  onChange,
  placeholder,
  value,
  ...props
}: SelectorOfFilesProps): ReactElement {
  const [options, setOptions] = useState<SelectorOption[]>([]);

  const computeOptions = useAsyncCallback(async () => {
    const directoryExists = await $FileSystem.exists(directoryPath);
    if (directoryExists) {
      const fileNames = await $FileSystem.getFileNames(directoryPath, true);
      const newOptions = fileNames
        .filter((fileName) => extensions.some((e) => fileName.endsWith(e)))
        .map((fileName) => ({ label: fileName, value: fileName }));
      setOptions(newOptions);
    }
    return undefined;
  }, [directoryPath, ...extensions]);

  useEffect(() => {
    computeOptions.call();
  }, [computeOptions.call]);

  useEffect(() => {
    if (!options.find((option) => option.value === value)) {
      const firstOption = options[0];
      onChange(firstOption ? firstOption.value : '');
    }
  }, [options]);

  return (
    <Selector
      isDisabled={isDisabled || !options.length || computeOptions.isLoading}
      isFullWidth={isFullWidth}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      value={value}
      {...props}
    />
  );
}
