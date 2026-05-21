
import React, { useMemo } from 'react';
import type { PlaybackStats, PlaybackStat } from '../services/localStorageService';

interface StatisticsDisplayProps {
  stats: PlaybackStats;
  onClear: () => void;
}

const StatRow: React.FC<{ stat: PlaybackStat & { id: string } }> = ({ stat }) => (
    <tr className="border-b border-slate-700 hover:bg-slate-700/50">
        <td className="p-3 text-slate-300 truncate max-w-xs" title={stat.name}>{stat.name}</td>
        <td className="p-3 text-center text-sky-400 font-semibold">{stat.count}</td>
        <td className="p-3 text-sm text-slate-400 text-right whitespace-nowrap">{new Date(stat.lastPlayed).toLocaleString()}</td>
    </tr>
);

export const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({ stats, onClear }) => {
    const sortedStats = useMemo(() => {
        return Object.entries(stats)
            .map(([id, data]) => {
                const stat = data as PlaybackStat;
                return { id, ...stat };
            })
            .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
    }, [stats]);

    if (sortedStats.length === 0) {
        return (
            <div className="mt-8 p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-center text-slate-400">
                No playback history yet. Play a script to see statistics here.
            </div>
        );
    }
    
    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-sky-400">Playback History</h2>
                <button
                    onClick={onClear}
                    className="px-3 py-1 text-sm border border-red-500 text-red-400 rounded-md hover:bg-red-500 hover:text-slate-900 transition-colors"
                    aria-label="Clear all playback history"
                >
                    <i className="fas fa-trash-alt mr-2"></i>
                    Clear History
                </button>
            </div>
            <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                <table className="min-w-full text-sm table-fixed">
                    <thead className="bg-slate-900/70">
                        <tr>
                            <th className="p-3 w-1/2 text-left font-semibold text-slate-300">Script Name</th>
                            <th className="p-3 w-1/6 text-center font-semibold text-slate-300">Plays</th>
                            <th className="p-3 w-1/3 text-right font-semibold text-slate-300">Last Played</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStats.map(stat => <StatRow key={stat.id} stat={stat} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
