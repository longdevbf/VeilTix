import { EventService } from './src/services/event.service.js';

async function test() {
    try {
        console.log("Starting test...");
        // Actually wait, importing from ts file in js will crash if not compiled.
    } catch(e) {
        console.error(e);
    }
}
test();
