// src/lib/utils/format.ts

/**
 * Format a Sui address for display (shortened with ellipsis)
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format SUI amount from MIST (1 SUI = 1,000,000,000 MIST)
 */
export function formatSuiAmount(
  amountInMist: string | number,
  decimals: number = 4
): string {
  const amount =
    typeof amountInMist === "string" ? parseFloat(amountInMist) : amountInMist;

  const sui = amount / 1_000_000_000;

  if (sui === 0) return "0";
  if (sui < 0.0001) return "< 0.0001";

  return sui.toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Format balance with proper decimal places and unit
 */
export function formatBalance(
  balance: string | number,
  decimals: number = 9,
  symbol: string = "SUI",
  displayDecimals: number = 4
): string {
  const amount = typeof balance === "string" ? parseFloat(balance) : balance;
  const divisor = Math.pow(10, decimals);
  const formatted = (amount / divisor)
    .toFixed(displayDecimals)
    .replace(/\.?0+$/, "");

  return `${formatted} ${symbol}`;
}

/**
 * Format transaction digest for display
 */
export function formatDigest(digest: string): string {
  return formatAddress(digest, 8, 6);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  // If today, show time only
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // If this year, show month and day
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  // Otherwise show full date
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format large numbers with appropriate units (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }

  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }

  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }

  return num.toString();
}

/**
 * Format percentage with proper precision
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Format gas cost for display
 */
export function formatGasCost(
  computationCost: number,
  storageCost: number,
  storageRebate: number = 0
): string {
  const total = computationCost + storageCost - storageRebate;
  return formatSuiAmount(total);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
