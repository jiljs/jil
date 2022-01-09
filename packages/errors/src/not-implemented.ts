export class NotImplementedError extends Error {
  constructor(message?: string) {
    super('NotImplemented');
    if (message) {
      this.message = message;
    }
  }
}
