import { ZodType } from 'zod';
import { $EitherErrorOr, EitherErrorOr } from './EitherErrorOr';
import ErrorReport from './ErrorReport';
import { $FileSystem } from './FileSystem';

export const $Serialization = {
  load: async <T>(
    path: string,
    schema: ZodType<T>,
  ): Promise<EitherErrorOr<T>> => {
    const errorPrefix = 'Serialization.load';

    const dataOrError = await $FileSystem.loadJson(path);
    if (dataOrError.isError) {
      const errorMessage = `${errorPrefix}: failed to load file`;
      return $EitherErrorOr.error(dataOrError.error.extend(errorMessage));
    }

    const data = schema.safeParse(dataOrError.value);
    if (!data.success) {
      const errorMessage = `${errorPrefix}: data is not valid`;
      return $EitherErrorOr.error(ErrorReport.from(errorMessage));
    }

    return $EitherErrorOr.value(data.data);
  },

  save: async <T>(path: string, data: T): Promise<ErrorReport | undefined> => {
    const error = await $FileSystem.saveJson(path, data);
    if (error) {
      const errorMessage = `Serialization.save: failed to save file`;
      return error.extend(errorMessage);
    }
  },
};
