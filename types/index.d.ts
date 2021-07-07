/**
 * This function gets the OS native UUID/GUID synchronously, hashed by default.
 * @param {boolean} [original=false] If true return original value of machine id, otherwise return hashed value (sha - 256)
 */
export declare function machineIdSync(original?: boolean): string;
/**
 * This function gets the OS native UUID/GUID asynchronously (recommended), hashed by default.
 *
 * Note: on windows this is still synchronous
 * @param {boolean} [original=false] If true return original value of machine id, otherwise return hashed value (sha - 256)
 *
 */
export declare function machineId(original?: boolean): Promise<string>;
