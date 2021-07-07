import {exec, execSync} from 'child_process';
import {createHash} from 'crypto';
import * as reg from "native-reg";

const { platform } = process;

const guid = {
    darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
    linux: '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
    freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid'
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
                .replace(/\r+|\n+|\s+/ig, '')
                .toLowerCase();
        case 'linux':
            return result
                .toString()
                .replace(/\r+|\n+|\s+/ig, '')
                .toLowerCase();
        case 'freebsd':
            return result
                .toString()
                .replace(/\r+|\n+|\s+/ig, '')
                .toLowerCase();
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
}

function windowsMachineId(): string {
    return reg.getValue(reg.HKEY.LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Cryptography", "MachineGuid").toString();
}

/**
 * This function gets the OS native UUID/GUID synchronously, hashed by default.
 * @param {boolean} [original=false] If true return original value of machine id, otherwise return hashed value (sha - 256)
 */
export function machineIdSync(original: boolean = false): string {
    const id = platform === "win32"
        ? windowsMachineId()
        : expose(execSync(guid[platform]).toString());

    return original ? id : hash(id);
}

/**
 * This function gets the OS native UUID/GUID asynchronously (recommended), hashed by default.
 *
 * Note: on windows this is still synchronous
 * @param {boolean} [original=false] If true return original value of machine id, otherwise return hashed value (sha - 256)
 *
 */
export function machineId(original: boolean = false): Promise<string> {
    return new Promise((resolve: Function, reject: Function): Object => {
        if (platform === "win32") {
            try {
                return resolve(windowsMachineId());
            } catch (error) {
                return reject(error);
            }
        }

        return exec(guid[platform], {}, (err: any, stdout: any, stderr: any) => {
            if (err) {
                return reject(new Error(`Error while obtaining machine id: ${err.stack}`));
            }

            const id = expose(stdout.toString());

            return resolve(original ? id : hash(id));
        });
    });
}
