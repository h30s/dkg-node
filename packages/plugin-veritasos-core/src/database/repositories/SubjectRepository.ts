import db from '../db';
import { Subject } from '../../types';

export class SubjectRepository {
  static create(subject: Subject): void {
    const store = db.getStore();
    store.subjects.set(subject.id, subject);
    if (subject.handle) {
      store.handleIndex.set(subject.handle, subject.id);
    }
  }

  static findById(id: string): Subject | undefined {
    const store = db.getStore();
    return store.subjects.get(id);
  }

  static findByHandle(handle: string): Subject | undefined {
    const store = db.getStore();
    const subjectId = store.handleIndex.get(handle);
    if (!subjectId) return undefined;
    return store.subjects.get(subjectId);
  }

  static findAll(): Subject[] {
    const store = db.getStore();
    return Array.from(store.subjects.values());
  }

  static count(): number {
    const store = db.getStore();
    return store.subjects.size;
  }
}
