import { LayoutProps, SpaceProps } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import useEffectAsync from '../../hooks/useEffectAsync';
import { $FileSystem } from '../../utils/FileSystem';
import Select, { SelectOption } from './Select';

interface SelectFilesProps extends LayoutProps, SpaceProps {
  directoryPath: string;
  extension?: string[];
  isDisabled?: boolean;
  isFullWidth?: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export default function SelectFiles({
  directoryPath,
  extension = [],
  isDisabled,
  isFullWidth,
  onChange,
  placeholder,
  value,
  ...props
}: SelectFilesProps): ReactElement {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffectAsync(async () => {
    onChange('');
    const directoryExists = await $FileSystem.exists(directoryPath);
    if (directoryExists) {
      const fileNames = await $FileSystem.getFileNames(directoryPath, true);
      setOptions(
        fileNames
          .filter((fileName) => extension.some((e) => fileName.endsWith(e)))
          .map((fileName) => ({ label: fileName, value: fileName })),
      );
    }
  }, [directoryPath]);

  return (
    <Select
      isDisabled={isDisabled || !options.length}
      isFullWidth={isFullWidth}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      value={value}
      {...props}
    />
  );
}
