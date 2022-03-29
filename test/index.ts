import { glob } from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
    const testDir = path.resolve(__dirname);
    const mocha = new Mocha({ ui: 'tdd' });

    return new Promise((resolve, reject) => {
        glob("**/*.test.js", { cwd: testDir }, (error, matches) => {
            if (error) {
                reject(error);
            }
            else {
                matches.forEach(file => mocha.addFile(path.resolve(testDir, file)));

                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} test${failures > 1 ? 's' : ''} failed.`));
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    });
}
