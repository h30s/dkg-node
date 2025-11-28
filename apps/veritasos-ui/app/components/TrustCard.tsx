'use client';

import { ReputationResponse } from '../lib/api';

interface TrustCardProps {
  data: ReputationResponse;
}

export default function TrustCard({ data }: TrustCardProps) {
  const { subject, reputation } = data;
  const scorePercent = Math.round(reputation.overallScore * 100);
  
  let trustLevel = 'Low';
  let trustColor = 'text-red-600 border-red-300';
  let progressColor = 'bg-red-500';
  
  if (reputation.overallScore >= 0.7) {
    trustLevel = 'High';
    trustColor = 'text-green-600 border-green-300';
    progressColor = 'bg-green-500';
  } else if (reputation.overallScore >= 0.4) {
    trustLevel = 'Moderate';
    trustColor = 'text-gray-700 border-gray-300';
    progressColor = 'bg-gray-500';
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subject.displayName}</h3>
            <p className="text-xs text-gray-600">{subject.handle}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">ID: {subject.id}</p>
          </div>
          <div className={`px-4 py-2 border ${trustColor}`}>
            <div className="text-[10px] font-medium">{trustLevel} Trust</div>
            <div className="text-2xl font-bold">{scorePercent}%</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Overall Reputation Score</span>
          <span className="text-xs text-gray-500">{reputation.overallScore.toFixed(3)}</span>
        </div>
        <div className="w-full bg-gray-200 h-2">
          <div
            className={`h-2 transition-all duration-500 ${progressColor}`}
            style={{ width: `${scorePercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Global Score</div>
          <div className="text-xl font-semibold text-gray-900">
            {Math.round(reputation.scores.global * 100)}%
          </div>
        </div>
        {reputation.scores.networkTrust !== undefined && (
          <div className="p-3 bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Network Trust</div>
            <div className="text-xl font-semibold text-gray-900">
              {Math.round(reputation.scores.networkTrust * 100)}%
            </div>
          </div>
        )}
        {reputation.scores.misinfoResistance !== undefined && (
          <div className="p-3 bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Misinfo Resistance</div>
            <div className="text-xl font-semibold text-gray-900">
              {Math.round(reputation.scores.misinfoResistance * 100)}%
            </div>
          </div>
        )}
      </div>

      {reputation.explanation && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Reputation Analysis</h4>
          <p className="text-xs text-gray-600">{reputation.explanation}</p>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between items-center mb-1.5">
          <span>Algorithm:</span>
          <span className="font-medium">{reputation.algorithmVersion}</span>
        </div>
        <div className="flex justify-between items-center mb-1.5">
          <span>Computed:</span>
          <span className="font-medium">{new Date(reputation.computedAt).toLocaleString()}</span>
        </div>
        {reputation.ual && (
          <div className="flex justify-between items-center">
            <span>DKG Asset (UAL):</span>
            <span className="font-mono text-[10px] truncate ml-2 max-w-xs" title={reputation.ual}>
              {reputation.ual}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
