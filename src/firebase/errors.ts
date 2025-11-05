'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(
      {
        operation: context.operation,
        path: context.path,
        // We only show the data in the error message if it's a write operation
        // to avoid leaking data in read operations.
        data:
          context.operation === 'create' || context.operation === 'update'
            ? context.requestResourceData
            : 'DATA_NOT_AVAILABLE_FOR_READ_OPS',
      },
      null,
      2
    )}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is to ensure the stack trace is captured correctly.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
