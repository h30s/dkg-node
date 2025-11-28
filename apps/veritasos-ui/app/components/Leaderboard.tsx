'use client';

import { useState, useEffect } from 'react';
import { ApiClient, ReputationResponse } from '../lib/api';

export default function Leaderboard() {
  const [data, setData] = useState<ReputationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const results = await ApiClient.getTopReputations(10);
      setData(results);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm font-medium">Loading trust metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Trust Leaderboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real-time reputation scores for top-performing identities
        </p>
      </div>

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Identity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Handle</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Trust Score</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Global</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Network</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, index) => {
                const scorePercent = Math.round(item.reputation.overallScore * 100);
                const globalPercent = Math.round(item.reputation.scores.global * 100);
                const networkPercent = item.reputation.scores.networkTrust !== undefined 
                  ? Math.round(item.reputation.scores.networkTrust * 100) : null;

                return (
                  <tr key={item.subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{item.subject.displayName}</div>
                      <div className="text-xs text-gray-500">{item.subject.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.subject.handle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        scorePercent >= 80 ? 'bg-green-100 text-green-800' :
                        scorePercent >= 60 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {scorePercent}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {globalPercent}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {networkPercent !== null ? `${networkPercent}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        scorePercent >= 80 ? 'bg-green-100 text-green-800' :
                        scorePercent >= 60 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {scorePercent >= 80 ? 'Excellent' :
                         scorePercent >= 60 ? 'Good' : 'Fair'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
