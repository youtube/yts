import * as path from 'path';

import {getFullPathInCwd} from './path_utils';

describe('getFullPathInCwd', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalCwd: () => string;

  beforeEach(() => {
    originalEnv = {...process.env};
    originalCwd = process.cwd;
  });

  afterEach(() => {
    // Restore process.env
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    process.cwd = originalCwd;
  });

  it('should return absolute path as is', () => {
    const absPath = path.resolve('/foo/bar');
    expect(getFullPathInCwd(absPath)).toBe(absPath);
  });

  it('should resolve relative path against cwd', () => {
    spyOn(process, 'cwd').and.returnValue('/mock/cwd');
    expect(getFullPathInCwd('bar')).toBe(path.join('/mock/cwd', 'bar'));
  });

  it('should resolve home directory', () => {
    process.env['HOME'] = '/mock/home';
    spyOn(process, 'cwd').and.returnValue('/mock/cwd');
    expect(getFullPathInCwd('~/bar')).toBe('/mock/home/bar');
  });
});
