import { ReleaseType } from 'semver';
import readline from 'readline';
import { releaseTypeList } from './constants';

export const readLineAsync = () => {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  return new Promise<string>(resolve => {
    rl.prompt();
    rl.on('line', line => {
      rl.close();
      resolve(line);
    });
  });
};

export const isSemverReleaseType = (
  releaseType: string,
): releaseType is ReleaseType => {
  return releaseTypeList.includes(releaseType);
};
