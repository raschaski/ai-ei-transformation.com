import type { CheckIn } from "../types";

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function pearsonCorrelation(first: number[], second: number[]) {
  if (first.length !== second.length || first.length < 3) return null;

  const firstAverage = average(first);
  const secondAverage = average(second);
  let numerator = 0;
  let firstSquareSum = 0;
  let secondSquareSum = 0;

  first.forEach((value, index) => {
    const firstDifference = value - firstAverage;
    const secondDifference = second[index] - secondAverage;
    numerator += firstDifference * secondDifference;
    firstSquareSum += firstDifference ** 2;
    secondSquareSum += secondDifference ** 2;
  });

  const denominator = Math.sqrt(firstSquareSum * secondSquareSum);
  return denominator === 0 ? null : numerator / denominator;
}

export function createLocalInsight(checkIns: CheckIn[]) {
  if (checkIns.length < 3) {
    return "Nach drei Check-ins können erste vorsichtige Zusammenhänge angezeigt werden.";
  }

  const correlation = pearsonCorrelation(
    checkIns.map((item) => item.ai_minutes),
    checkIns.map((item) => item.stress),
  );

  if (correlation === null || Math.abs(correlation) < 0.25) {
    return "Bisher ist kein deutlicher Zusammenhang zwischen KI-Nutzungsdauer und Stress erkennbar.";
  }

  if (correlation > 0) {
    return "An Tagen mit längerer KI-Nutzung hast du tendenziell mehr Stress angegeben.";
  }

  return "An Tagen mit längerer KI-Nutzung hast du tendenziell weniger Stress angegeben.";
}
