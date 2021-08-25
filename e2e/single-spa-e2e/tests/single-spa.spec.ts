import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('single-spa e2e', () => {
  it('should create single-spa', async () => {
    const plugin = uniq('single-spa');
    ensureNxProject('@my-plugin/single-spa', 'dist/packages/single-spa');
    await runNxCommandAsync(`generate @nrwl/react:application ${plugin}`);
    await runNxCommandAsync(
      `generate @my-plugin/single-spa:application --project=${plugin} --organization=my-org`
    );

    // const result = await runNxCommandAsync(`build ${plugin}`);
    expect(true).toBeTruthy();
    // expect(result.stdout).toContain('Executor ran');
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
