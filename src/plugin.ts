import { Compiler } from 'webpack';
import semverValid from 'semver/functions/valid';
import semverInc from 'semver/functions/inc';
import chalk from 'chalk';
import cliSelect from '@hseoy/cli-select';
import { readPackage, PackageJson } from 'read-pkg';
import fs from 'fs';
import { isSemverReleaseType, readLineAsync } from './utils';
import { releaseTypeList } from './constants';

export interface VersionWebpackPluginOptions {
  rootPath: string;
}

export default class VersionWebpackPlugin {
  private pluginName = 'VersionWebpackPlugin';

  private options: VersionWebpackPluginOptions;

  constructor(options?: VersionWebpackPluginOptions) {
    this.options = options ?? { rootPath: process.cwd() };
  }

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapPromise(this.pluginName, async () => {
      const packageJsonData = await readPackage({
        cwd: this.options.rootPath,
        normalize: false,
      });
      const currentVersion = packageJsonData.version ?? '0.0.0';
      const updatedVersion = await this.updateVersionThroughUserInput(
        currentVersion,
      );
      packageJsonData.version = updatedVersion;
      await this.writePackageJsonToFile(packageJsonData);

      console.info(chalk.green('Previous Version: ', currentVersion));
      console.info(chalk.green('Updated Version: ', updatedVersion));
    });
  }

  async writePackageJsonToFile(packageJsonData: PackageJson) {
    await fs.promises.writeFile(
      `${this.options.rootPath}/package.json`,
      `${JSON.stringify(packageJsonData, null, 2)}\n`,
    );
  }

  async updateVersionThroughUserInput(currentVersion: string) {
    if (semverValid(currentVersion) === null) {
      throw new Error(`Invalid semantic version - ${currentVersion}`);
    }

    const versionUpdateOption = [...releaseTypeList, 'custom'];

    const selectedUpdateOption = await cliSelect({
      values: versionUpdateOption,
      cleanup: true,
      valueRenderer: (value, selected) => {
        const selectedSymbol = '(x)';
        const unselectedSymbol = '( )';
        if (selected) {
          if (value === 'custom') {
            return {
              value: chalk.underline(chalk.yellow(value)),
              symbol: chalk.yellow(selectedSymbol),
            };
          }
          return {
            value: chalk.underline(chalk.cyan(value)),
            symbol: chalk.cyan(selectedSymbol),
          };
        }
        return { value, symbol: unselectedSymbol };
      },
    });

    if (!selectedUpdateOption) {
      console.info(chalk.yellow('You did not select version update option.\n'));
      return currentVersion;
    }

    let updatedVersion = currentVersion;
    const releaseType = selectedUpdateOption.value;

    if (isSemverReleaseType(releaseType)) {
      updatedVersion = semverInc(currentVersion, releaseType) || currentVersion;
    } else if (releaseType === 'custom') {
      process.stdout.write('Custom version: ');
      updatedVersion = await readLineAsync();
    }

    if (semverValid(updatedVersion) === null) {
      throw new Error(`Invalid semantic version - ${currentVersion}`);
    }

    return updatedVersion;
  }
}
