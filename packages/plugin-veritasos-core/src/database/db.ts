/**
 * Simple in-memory database for VeritasOS
 * Stores subjects, edges, and reputation profiles
 */

export interface DbStore {
  subjects: Map<string, any>;
  edges: Map<string, any>;
  reputationProfiles: Map<string, any>;
  contentItems: Map<string, any>;
  handleIndex: Map<string, string>; // handle -> subjectId
}

class InMemoryDatabase {
  private store: DbStore;

  constructor() {
    this.store = {
      subjects: new Map(),
      edges: new Map(),
      reputationProfiles: new Map(),
      contentItems: new Map(),
      handleIndex: new Map(),
    };
  }

  getStore(): DbStore {
    return this.store;
  }

  reset(): void {
    this.store.subjects.clear();
    this.store.edges.clear();
    this.store.reputationProfiles.clear();
    this.store.contentItems.clear();
    this.store.handleIndex.clear();
  }
}

export const db = new InMemoryDatabase();
export default db;
