import db from '../db';
import { Edge } from '../../types';

export class EdgeRepository {
  static create(edge: Edge): void {
    const store = db.getStore();
    store.edges.set(edge.id, edge);
  }

  static findBySourceId(sourceId: string): Edge[] {
    const store = db.getStore();
    return Array.from(store.edges.values())
      .filter(edge => edge.sourceId === sourceId);
  }

  static findByTargetId(targetId: string): Edge[] {
    const store = db.getStore();
    return Array.from(store.edges.values())
      .filter(edge => edge.targetId === targetId);
  }

  static findAll(): Edge[] {
    const store = db.getStore();
    return Array.from(store.edges.values());
  }

  static count(): number {
    const store = db.getStore();
    return store.edges.size;
  }
}
