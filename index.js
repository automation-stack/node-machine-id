/* @flow */
import {exec, execSync} from 'child_process';
import {createHash} from 'crypto';

let {platform}: Object = process,
    guid: Object = {
        darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
        win32: 'REG QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid',
        linux: 'cat /var/lib/dbus/machine-id'
    };

function hash(guid: string): string {
    return createHash('sha256').update(guid).digest('hex');
}

function expose(result: string): string {
    switch (platform) {
        case 'darwin':
            return result
                .split('IOPlatformUUID')[1]
                .split('\n')[0].replace(/\=|\s+|\"/ig, '')
                .toLowerCase();
        case 'win32':
            return result
                .toString()
                .split('REG_SZ')[1]
                .replace(/\r+|\n+|\s+/ig, '');
        case 'linux':
            return result
                .toString()
                .toLowerCase();
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

function machineIdSync(original: boolean): string {
    let id: string = expose(execSync(guid[platform]).toString());
    return original ? id : hash(id);
}

function machineId(original: boolean): Promise {
    return new Promise((resolve: Function, reject: Function): Object => {
        return exec(guid[platform], (err: any, stdout: any, stderr: any): string => {
            if (err) {
                return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
            }
            let id: string = expose(stdout.toString());
            return resolve(original ? id : hash(id));
        });
    });
}


export {machineId, machineIdSync};
