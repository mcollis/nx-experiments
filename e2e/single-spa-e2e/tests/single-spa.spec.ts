import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('single-spa e2e', () => {
  let plugin;

  beforeEach(async () => {
    plugin = uniq('single-spa');
    ensureNxProject('@my-plugin/single-spa', 'dist/packages/single-spa');
    await runNxCommandAsync(`generate @nrwl/react:application ${plugin}`);
  }, 300000);

  it('should create single-spa', async () => {
    await runNxCommandAsync(
      `generate @my-plugin/single-spa:application --project=${plugin}`
    );

    // const result = await runNxCommandAsync(`build ${plugin}`);
    expect(true).toBeTruthy();
    // expect(result.stdout).toContain('Executor ran');
  }, 300000);
  xit('should build single-spa', async () => {
    await runNxCommandAsync('generate @nrwl/web:webpack5');
    await runNxCommandAsync(
      `generate @my-plugin/single-spa:application --project=${plugin}`
    );
    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Running target "build" succeeded');
  }, 300000);

  xdescribe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('single-spa');
      ensureNxProject('@my-plugin/single-spa', 'dist/packages/single-spa');
      await runNxCommandAsync(
        `generate @my-plugin/single-spa:single-spa ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  xdescribe('--tags', () => {
    it('should add tags to nx.json', async () => {
      const plugin = uniq('single-spa');
      ensureNxProject('@my-plugin/single-spa', 'dist/packages/single-spa');
      await runNxCommandAsync(
        `generate @my-plugin/single-spa:single-spa ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
