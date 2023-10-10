export const calculateStatValues = (stats) => {
  const statMeans = {};
  const statStdDevs = {};

  for (const stat in stats[0]) {
    const values = stats.map((player) => player[stat]);
    const sum = values.reduce((total, value) => total + value, 0);
    const mean = sum / values.length;
    statMeans[stat] = mean;

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
    const scarcityFactor = scarcityFactors[player.positionCode];
    const adjustedZScore =
      ((player[stat] - statMeans[stat]) / statStdDevs[stat]) * scarcityFactor;
    return total + adjustedZScore * weights[stat];
  }, 0);

  return totalZScore;
};
