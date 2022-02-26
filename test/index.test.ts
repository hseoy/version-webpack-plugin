import webpack, { Compiler } from 'webpack';
import path from 'path';
import VersionWebpackPlugin from '../src/plugin';

const compileAsync = (compiler: Compiler) => {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      }

      resolve(stats);
    });
  });
};

export const pluginCompile = async () => {
  const plugin = new VersionWebpackPlugin();

  const webpackOptions = {
    entry: path.resolve(__dirname, 'mockDir/index.js'),
    plugins: [plugin],
  };

  const compiler = webpack(webpackOptions);

  await compileAsync(compiler);

  return { plugin, compiler };
};

describe('version webpack plugin test', () => {
  it('should be no errors when executed.', async () => {
    await pluginCompile();
  });
});
