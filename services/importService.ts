
import { Trade, MarketType, TradeSide, AccountType } from '../types';

/**
 * Normalizes various date formats (YYYY.MM.DD, DD/MM/YYYY, etc.) to YYYY-MM-DD
 */
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Remove time if present
  const datePart = dateStr.split(' ')[0];
  
  // Replace dots or slashes with hyphens
  let normalized = datePart.replace(/[./]/g, '-');
  
  // Check if it's DD-MM-YYYY and convert to YYYY-MM-DD
  const parts = normalized.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      // Assuming DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  return normalized;
};

/**
 * Robustly parses a MetaTrader 5 HTML report.
 * It identifies the correct table by looking for header keywords and maps
 * columns dynamically to handle different report localized versions or layouts.
 */
export const parseMT5Report = async (htmlContent: string): Promise<Trade[]> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const tables = Array.from(doc.querySelectorAll('table'));
  const allParsedTrades: Trade[] = [];

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) continue;

    // 1. Find the header row by searching for keywords
    let headerIndex = -1;
    let columnMap: Record<string, number> = {};

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const text = (rows[i].textContent || '').toLowerCase();
      if (text.includes('symbol') && (text.includes('profit') || text.includes('p/l'))) {
        headerIndex = i;
        const cells = Array.from(rows[i].querySelectorAll('td, th'));
        cells.forEach((cell, idx) => {
          const content = (cell.textContent || '').toLowerCase().trim();
          if (content.includes('symbol')) columnMap.symbol = idx;
          if (content.includes('type')) columnMap.type = idx;
          if (content.includes('volume') || content.includes('size')) columnMap.volume = idx;
          if (content.includes('price') && !columnMap.entryPrice) columnMap.entryPrice = idx;
          if (content.includes('price') && columnMap.entryPrice !== undefined) columnMap.exitPrice = idx;
          if (content.includes('profit') || content.includes('p/l')) columnMap.profit = idx;
          if (content.includes('time') || content.includes('date')) columnMap.date = idx;
        });
        break;
      }
    }

    if (headerIndex === -1 || columnMap.symbol === undefined || columnMap.profit === undefined) continue;

    // 2. Process rows after header
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      if (cells.length <= Math.max(...Object.values(columnMap))) continue;

      const rawType = cells[columnMap.type]?.textContent?.trim().toLowerCase() || '';
      const symbol = cells[columnMap.symbol]?.textContent?.trim() || '';
      const pnlRaw = cells[columnMap.profit]?.textContent?.trim().replace(/[^\d.-]/g, '') || '';
      const pnl = parseFloat(pnlRaw);

      if (!rawType.includes('buy') && !rawType.includes('sell')) continue;
      if (isNaN(pnl)) continue;
      if (!symbol) continue;

      const rawDate = cells[columnMap.date]?.textContent?.trim() || "";
      const dateStr = normalizeDate(rawDate);
      const size = parseFloat(cells[columnMap.volume]?.textContent?.trim() || '1') || 1;
      const entryPrice = parseFloat(cells[columnMap.entryPrice]?.textContent?.trim() || '0') || 0;
      const exitPrice = parseFloat(cells[columnMap.exitPrice]?.textContent?.trim() || '0') || 0;

      allParsedTrades.push({
        id: `mt5-${crypto.randomUUID()}-${i}`,
        date: dateStr,
        instrument: symbol,
        marketType: symbol.length > 5 ? MarketType.FOREX : MarketType.FUTURES,
        accountType: AccountType.PERSONAL_CAPITAL,
        side: rawType.includes('buy') ? TradeSide.LONG : TradeSide.SHORT,
        entryPrice,
        exitPrice,
        size,
        pnl,
        notes: "Imported from MT5 Report"
      });
    }
  }

  return allParsedTrades;
};
