import { mean, standardDeviation } from "simple-statistics";

export const calculateStatValues = (stats) => {
  const statMeans = {};
  const statStdDevs = {};

  for (const stat in stats[0]) {
    const values = stats.map((player) => player[stat]);

    // Calculate mean and standard deviation using simple-statistics
    statMeans[stat] = mean(values);
    statStdDevs[stat] = standardDeviation(values);
  }

  return { statMeans, statStdDevs };
};

export const calculateZScore = (
  player,
  statMeans,
  statStdDevs,
  scarcityFactors,
  weights,
  sumSeasons
) => {
  let totalZScore = 0;
  let statCount = 0; // Count the number of valid stats considered

  Object.keys(weights).forEach((stat) => {
    let weight = weights[stat];
    if (stat === "goalsAgainstAverage") {
      weight = -1 * weight;
    }

    // Only consider stats with a non-zero weight and valid player stat
    if (weight !== 0) {
      const scarcityFactor = scarcityFactors[player.positionCode] ?? 1;
      const mean = statMeans[stat];
      const stdDev = statStdDevs[stat];
      const playerStat = player[sumSeasons ? `${stat}Weighted` : stat];

      const adjustedZScore =
        stdDev === 0
          ? 0
          : ((playerStat - mean) / stdDev) * weight * scarcityFactor;

      // Calculate adjusted Z-score
      totalZScore += adjustedZScore;
      statCount++; // Increment for each valid stat considered
    }
  });

  // Return the average Z-score by dividing the total by the number of valid stats
  return statCount > 0 ? totalZScore / statCount : 0;
};
