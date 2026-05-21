export interface PlaybackStat {
  name: string;
  count: number;
  lastPlayed: string; // ISO string date
}

export interface PlaybackStats {
  [id: string]: PlaybackStat;
}

const STATS_KEY = 'playbackStats';

export const getPlaybackStats = (): PlaybackStats => {
  try {
    const statsJson = localStorage.getItem(STATS_KEY);
    if (statsJson) {
      // Basic validation
      const stats = JSON.parse(statsJson);
      if (typeof stats === 'object' && stats !== null) {
        return stats;
      }
    }
  } catch (error) {
    console.error("Failed to read playback stats from localStorage", error);
  }
  return {};
};

export const updatePlaybackStat = (id: string, name: string): PlaybackStats => {
  const stats = getPlaybackStats();
  const now = new Date().toISOString();
  
  const existingStat = stats[id];

  if (existingStat && typeof existingStat.count === 'number') {
    // If stat exists and has a valid count, increment it
    existingStat.count += 1;
    existingStat.lastPlayed = now;
    // Potentially update the name if it's more specific now
    if (name && existingStat.name !== name) {
        existingStat.name = name;
    }
  } else {
    // Otherwise, it's a new stat or the old one is malformed, so we create/overwrite it
    stats[id] = {
      name,
      count: 1,
      lastPlayed: now,
    };
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save playback stats to localStorage", error);
  }
  
  return stats;
};

export const clearPlaybackStats = (): PlaybackStats => {
    try {
        localStorage.removeItem(STATS_KEY);
    } catch (error) {
        console.error("Failed to clear playback stats from localStorage", error);
    }
    return {};
}
