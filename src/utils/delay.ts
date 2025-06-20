/**
 *  Promisified delay, in seconds
 */
export function delay(delayInSeconds = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delayInSeconds * 1000);
  });
}
