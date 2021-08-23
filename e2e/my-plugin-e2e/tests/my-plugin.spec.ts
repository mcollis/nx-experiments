import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('my-plugin e2e', () => {
  it('should create my-plugin', async () => {
    const plugin = uniq('my-plugin');
    ensureNxProject('@my-plugin/my-plugin', 'dist/packages/my-plugin');
    await runNxCommandAsync(
      `generate @my-plugin/my-plugin:my-plugin ${plugin} --orgName=my-org --style=css --no-interactive`
    );

    // const result = await runNxCommandAsync(`build ${plugin}`);
    // expect(result.stdout).toContain('Executor ran');
  }, 120000);
});
