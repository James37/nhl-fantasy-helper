export const calculateStatValues = (stats) => {
  const statMeans = {};
  const statStdDevs = {};

  for (const stat in stats[0]) {
    const values = stats.map((player) => player[stat]);

    // Calculate mean
    const sum = values.reduce((total, value) => total + value, 0);
    const mean = sum / values.length;
    statMeans[stat] = mean;

    // Calculate standard deviation
    const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
    const sumSquaredDifferences = squaredDifferences.reduce(
      (total, value) => total + value,
      0
    );
    const variance = sumSquaredDifferences / values.length;
    const stdDev = Math.sqrt(variance);
    statStdDevs[stat] = stdDev;
  }

  return { statMeans, statStdDevs };
};

export const calculateZScore = (
  player,
  statMeans,
  statStdDevs,
  scarcityFactors,
  weights
) => {
  const totalZScore = Object.keys(weights).reduce((total, stat) => {
    const scarcityFactor = scarcityFactors[player.positionCode] || 1; // Fallback to 1 if undefined

    const mean = statMeans[stat];
    const stdDev = statStdDevs[stat];

    // Check if standard deviation is 0 to avoid division by 0
    if (stdDev === 0) {
      return total; // Skip this stat, or handle as needed (e.g., assign zero z-score for this stat)
    }

    const adjustedZScore = ((player[stat] - mean) / stdDev) * scarcityFactor;

    return total + adjustedZScore * weights[stat];
  }, 0);

  return totalZScore;
};
