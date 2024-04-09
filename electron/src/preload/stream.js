import { ipcRenderer } from "electron";
import { EventIterator } from "event-iterator"

const validChannels = [
    "hyperedges",
    "chat",
];

// Handle streaming back messages from the main process to renderer in async iterator
export async function stream(event, input, options = {}) {
    const channel = event.split(".")[0];
    return new EventIterator(
        (queue) => {
            if (!validChannels.includes(channel)) return null;

            const subscription = (_, event) => {
                queue.push(event);

                if (event.event.endsWith(".stop")) {
                    queue.stop();
                }
            }

            ipcRenderer.on(channel, subscription);

            const response = ipcRenderer.invoke(event, input, options);
            response.catch(queue.fail);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            }
        }
    )
}