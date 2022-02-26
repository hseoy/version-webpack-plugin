import { Compiler } from 'webpack';

export default class VersionWebpackPlugin {
  private pluginName = 'VersionWebpackPlugin';

  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tapPromise(this.pluginName, async () => {});
  }
}
