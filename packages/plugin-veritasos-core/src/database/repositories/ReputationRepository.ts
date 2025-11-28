import db from '../db';
import { ReputationProfile } from '../../types';

export class ReputationRepository {
  static upsert(profile: ReputationProfile): void {
    const store = db.getStore();
    store.reputationProfiles.set(profile.subjectId, profile);
  }

  static findBySubjectId(subjectId: string): ReputationProfile | undefined {
    const store = db.getStore();
    return store.reputationProfiles.get(subjectId);
  }

  static findTopN(limit: number = 20): ReputationProfile[] {
    const store = db.getStore();
    const profiles = Array.from(store.reputationProfiles.values());
    return profiles
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  }

  static count(): number {
    const store = db.getStore();
    return store.reputationProfiles.size;
  }
}
