export const mockSuccessResponse = {success: true};
export const mockFailResponse = {success: false};

export function promiseThatIsResolved() {
  return () => Promise.resolve(mockSuccessResponse);
}

export function promiseThatIsRejected() {
  return () => Promise.reject(mockFailResponse);
}

export function promiseThatFailsOnceThenSucceeds() {
  return (() => {
    let firstAttempt = true;

    return () => {
      if (firstAttempt) {
        firstAttempt = false;
        return Promise.reject(mockFailResponse);
      }

      return Promise.resolve(mockSuccessResponse);
    };
  })();
}
