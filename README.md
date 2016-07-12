## Unique machine (desktop) id for Electron application

## Features
- Hardware independent
- Unique within the OS installation
- No elevated rights required
- No external dependencies and does not require any native bindings
- Cross-platform (OSx, Win, Linux)

## Installation
```
npm install electron-machine-id
```

## Usage
### Function: machineId(original)
- original ```<Boolean>```, If ```true``` return original value of machine id, otherwise return hashed value (sha-256), default: ```false```

### Function: machineIdSync(original);
- Syncronous version ```machineId```

```js
import {machineId, machineIdSync} from 'electron-machine-id';

// Asyncronous call with async/await or Promise

async function getMachineId() {
    let id = await machineId();
    ...
}

machineId().then((id) => {
    ...
})

// Syncronous call

let id = machineIdSync()
// id = c24b0fe51856497eebb6a2bfcd120247aac0d6334d670bb92e09a00ce8169365
let id = machineIdSync({original: true})
// id = 98912984-c4e9-5ceb-8000-03882a0485e4
```
