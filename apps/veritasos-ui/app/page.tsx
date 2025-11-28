'use client';

import { useState, useEffect } from 'react';
import { ApiClient, ReputationResponse, Stats } from './lib/api';
import TrustCard from './components/TrustCard';
import Leaderboard from './components/Leaderboard';
import SearchBar from './components/SearchBar';

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchResult, setSearchResult] = useState<ReputationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ApiClient.getStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleSearch = async (query: string) => {
    setError(null);
    setSearchResult(null);
    setLoading(true);

    try {
      let result: ReputationResponse;
      
      if (query.startsWith('@') || !query.includes('-')) {
        result = await ApiClient.getReputationByHandle(query);
      } else {
        result = await ApiClient.getReputationById(query);
      }
      
      setSearchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-8">
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">VeritasOS</h1>
              <div className="flex space-x-6 text-sm">
                <span className="text-gray-700">Reputation Explorer</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Built on OriginTrail DKG Node
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {stats && (
          <div className="flex space-x-4 mb-6 text-xs text-gray-600">
            <span>{stats.subjects} Identities</span>
            <span>·</span>
            <span>{stats.edges} Connections</span>
            <span>·</span>
            <span>{stats.reputationProfiles} Profiles</span>
          </div>
        )}

        <section className="mb-6">
          <SearchBar onSearch={handleSearch} loading={loading} />
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600 text-xs">Querying reputation oracle...</p>
            </div>
          )}

          {searchResult && !loading && (
            <div className="mt-6">
              <TrustCard data={searchResult} />
            </div>
          )}
        </section>

        <section>
          <Leaderboard />
        </section>
      </div>
    </div>
  );
}
