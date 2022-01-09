export class NotSupportedError extends Error {
  constructor(message?: string) {
    super('NotSupported');
    if (message) {
      this.message = message;
    }
  }
}
