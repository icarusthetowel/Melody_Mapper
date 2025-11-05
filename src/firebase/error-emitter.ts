import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We can't type EventEmitter directly, so we create a wrapper.
class TypedEventEmitter {
  private emitter = new EventEmitter();

  on<T extends keyof AppEvents>(event: T, listener: AppEvents[T]) {
    this.emitter.on(event, listener);
  }

  off<T extends keyof AppEvents>(event: T, listener: AppEvents[T]) {
    this.emitter.off(event, listener);
  }

  emit<T extends keyof AppEvents>(event: T, ...args: Parameters<AppEvents[T]>) {
    this.emitter.emit(event, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter();
