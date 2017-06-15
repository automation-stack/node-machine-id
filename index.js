/* @flow */
import {exec, execSync} from 'child_process';
import {createHash} from 'crypto';

let {platform, arch}: Object = process,
    win32RegBinPath = {
        x64: '%windir%\\System32',
        ia32: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32'
    },
    guid: Object = {
        darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
        win32: `${win32RegBinPath[arch]}\\REG ` +
            `QUERY HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography ` +
            `/v MachineGuid`,
        linux: 'cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || :',
        freebsd: 'kenv -q smbios.system.uuid'
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

export function machineIdSync(original: boolean): string {
    let id: string = expose(execSync(guid[platform]).toString());
    return original ? id : hash(id);
}

export function machineId(original: boolean): Promise<string> {
    return new Promise((resolve: Function, reject: Function): Object => {
        return exec(guid[platform], {}, (err: any, stdout: any, stderr: any) => {
            if (err) {
                return reject(
                    new Error(`Error while obtaining machine id: ${err.stack}`)
                );
            }
            let id: string = expose(stdout.toString());
            return resolve(original ? id : hash(id));
        });
    });
}