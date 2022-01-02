import * as Tauri from '@tauri-apps/api';

export interface Process {
  code: number | null;
  stdout: string;
  stderr: string;
}

export const $Shell = {
  execute: (program: string, args: string[]): Promise<Process> => {
    return new Promise(async (resolve) => {
      const command = new Tauri.shell.Command(program, args);
      try {
        const output = await command.execute();
        resolve(output);
      } catch (error) {
        resolve({
          code: null,
          stdout: '',
          stderr:
            error instanceof Error
              ? error.message
              : `Failed to execute "${program}"`,
        });
      }
    });
  },

  run: (
    program: string,
    args: string[],
    {
      onClose,
      onError,
      onStderr,
      onStdout,
    }: {
      onClose?: (data: unknown) => void;
      onError?: (error: unknown) => void;
      onStderr?: (line: unknown) => void;
      onStdout?: (line: unknown) => void;
    },
  ): void => {
    const command = new Tauri.shell.Command(program, args);

    command.on('close', (data) => onClose?.(data));

    command.on('error', (error) => onError?.(error));

    command.stderr.on('data', (data) => onStderr?.(data));
    command.stdout.on('data', (data) => onStdout?.(data));

    command.spawn();
  },
};
