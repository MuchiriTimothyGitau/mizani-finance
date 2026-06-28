import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreTransactions,
  parseAmount,
  parseDate,
  monthsBetween,
  daysBetween,
  ratio,
  isRoundWithdrawal,
  isOpeningBalance,
  averageOutflowPerTransaction,
  sanitizeErrorMessage,
  parsePaymentLogConfig,
} from '../../functions/config/index.js';

describe('parseAmount', () => {
  it('returns NaN for undefined', () => {
    assert(Number.isNaN(parseAmount(undefined)));
  });
  it('returns NaN for null', () => {
    assert(Number.isNaN(parseAmount(null)));
  });
  it('returns NaN for empty string', () => {
    assert(Number.isNaN(parseAmount('')));
  });
  it('parses comma-separated numbers', () => {
    assert.equal(parseAmount('1,000'), 1000);
  });
  it('trims whitespace', () => {
    assert.equal(parseAmount('  500  '), 500);
  });
  it('handles zero', () => {
    assert.equal(parseAmount('0'), 0);
  });
  it('handles negative decimals', () => {
    assert.equal(parseAmount('-1,234.56'), -1234.56);
  });
});

describe('parseDate', () => {
  it('returns null for null', () => {
    assert.equal(parseDate(null), null);
  });
  it('returns null for empty string', () => {
    assert.equal(parseDate(''), null);
  });
  it('returns null for invalid date', () => {
    assert.equal(parseDate('not-a-date'), null);
  });
  it('parses a valid date string', () => {
    const result = parseDate('2026-06-01');
    assert.notEqual(result, null);
    assert.equal(result.getTime(), new Date('2026-06-01').getTime());
  });
});

describe('monthsBetween', () => {
  it('returns default for null dates', () => {
    assert.equal(monthsBetween(null, null), 3);
  });
  it('returns minimum 1 for same date', () => {
    const d = new Date('2026-06-01');
    assert.equal(monthsBetween(d, d), 1);
  });
  it('calculates months between dates', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-04-01');
    const result = monthsBetween(start, end);
    assert(result > 2.9 && result < 3.1);
  });
});

describe('daysBetween', () => {
  it('returns null for null dates', () => {
    assert.equal(daysBetween(null, null), null);
  });
  it('returns 0 for same date', () => {
    const d = new Date('2026-06-01');
    assert.equal(daysBetween(d, d), 0);
  });
  it('calculates days between dates', () => {
    const start = new Date('2026-06-01');
    const end = new Date('2026-06-10');
    assert.equal(daysBetween(start, end), 9);
  });
});

describe('ratio', () => {
  it('returns 0 when denominator is 0', () => {
    assert.equal(ratio(10, 0), 0);
  });
  it('calculates numerator / denominator', () => {
    assert.equal(ratio(10, 2), 5);
  });
  it('handles negative values', () => {
    assert.equal(ratio(-10, 5), -2);
  });
});

describe('isRoundWithdrawal', () => {
  it('returns true for -1000', () => {
    assert.equal(isRoundWithdrawal(-1000), true);
  });
  it('returns false for -500 (below threshold)', () => {
    assert.equal(isRoundWithdrawal(-500), false);
  });
  it('returns false for -1001 (not round)', () => {
    assert.equal(isRoundWithdrawal(-1001), false);
  });
  it('returns false for positive amounts', () => {
    assert.equal(isRoundWithdrawal(1000), false);
  });
  it('returns false for zero', () => {
    assert.equal(isRoundWithdrawal(0), false);
  });
});

describe('isOpeningBalance', () => {
  it('detects "opening" in description', () => {
    assert.equal(isOpeningBalance({ amount: 1000, description: 'opening balance' }), true);
  });
  it('detects "balance brought forward"', () => {
    assert.equal(isOpeningBalance({ amount: 5000, description: 'balance brought forward' }), true);
  });
  it('returns false for non-opening inflow', () => {
    assert.equal(isOpeningBalance({ amount: 1000, description: 'sales revenue' }), false);
  });
  it('returns false for outflows', () => {
    assert.equal(isOpeningBalance({ amount: -1000, description: 'opening' }), false);
  });
});

describe('averageOutflowPerTransaction', () => {
  it('returns 0 for empty array', () => {
    assert.equal(averageOutflowPerTransaction([]), 0);
  });
  it('returns abs value for single outflow', () => {
    const rows = [{ amount: -500 }, { amount: 1000 }];
    assert.equal(averageOutflowPerTransaction(rows), 500);
  });
  it('averages multiple outflows', () => {
    const rows = [{ amount: -200 }, { amount: -400 }, { amount: 100 }];
    assert.equal(averageOutflowPerTransaction(rows), 300);
  });
});

describe('sanitizeErrorMessage', () => {
  it('returns default for null', () => {
    assert.equal(sanitizeErrorMessage(null), 'Operation failed');
  });
  it('returns default for undefined', () => {
    assert.equal(sanitizeErrorMessage(undefined), 'Operation failed');
  });
  it('returns default for non-string', () => {
    assert.equal(sanitizeErrorMessage(42), 'Operation failed');
  });
  it('returns default for empty string', () => {
    assert.equal(sanitizeErrorMessage(''), 'Operation failed');
  });
  it('returns default for whitespace-only', () => {
    assert.equal(sanitizeErrorMessage('   '), 'Operation failed');
  });
  it('trims short messages', () => {
    assert.equal(sanitizeErrorMessage('  error occurred  '), 'error occurred');
  });
  it('truncates messages over 200 chars', () => {
    const long = 'x'.repeat(250);
    const result = sanitizeErrorMessage(long);
    assert.equal(result.length, 203);
    assert.equal(result.endsWith('...'), true);
  });
});

describe('parsePaymentLogConfig', () => {
  it('returns null address when env not set', () => {
    const config = parsePaymentLogConfig();
    assert.equal(config.address, null);
    assert.equal(config.contractExplorerUrl, null);
  });
});

describe('scoreTransactions', () => {
  const sampleRows = [
    { date: '2026-01-01', description: 'opening balance', amount: '1,000,000', balance: '1,000,000' },
    { date: '2026-01-15', description: 'sales revenue', amount: '500,000', balance: '1,500,000' },
    { date: '2026-02-01', description: 'rent', amount: '-150,000', balance: '1,350,000' },
    { date: '2026-02-15', description: 'payroll', amount: '-300,000', balance: '1,050,000' },
    { date: '2026-03-01', description: 'inventory purchase', amount: '-200,000', balance: '850,000' },
    { date: '2026-03-15', description: 'sales revenue', amount: '300,000', balance: '1,150,000' },
  ];

  it('throws for empty array', () => {
    assert.throws(() => scoreTransactions([]), /non-empty/);
  });

  it('throws for no valid amounts', () => {
    assert.throws(() => scoreTransactions([{ date: '2026-01-01', amount: 'invalid' }]), /No valid/);
  });

  it('returns correct structure', () => {
    const result = scoreTransactions(sampleRows);
    assert.ok(result.balance);
    assert.ok(result.totalInflow);
    assert.ok(result.totalOutflow);
    assert.ok(result.burnRate);
    assert.ok(Array.isArray(result.flags));
    assert.ok(result.metrics);
    assert.ok(Array.isArray(result.transactions));
  });

  it('calculates total inflow excluding opening', () => {
    const result = scoreTransactions(sampleRows);
    assert.equal(result.totalInflow, 800000);
  });

  it('calculates total outflow as absolute sum', () => {
    const result = scoreTransactions(sampleRows);
    assert.equal(result.totalOutflow, 650000);
  });

  it('includes onChainPayments in adjustedBalance', () => {
    const result = scoreTransactions(sampleRows, [{ amount: '0.5' }]);
    assert.equal(result.adjustedBalance, result.balance + 0.5);
  });

  it('sets riskLevel to low when no flags are triggered', () => {
    const safeRows = [
      { date: '2026-01-15', description: 'revenue a', amount: '50000', balance: '500000' },
      { date: '2026-02-15', description: 'revenue b', amount: '50000', balance: '550000' },
      { date: '2026-03-15', description: 'revenue c', amount: '50000', balance: '600000' },
      { date: '2026-04-15', description: 'revenue d', amount: '50000', balance: '650000' },
      { date: '2026-05-01', description: 'rent', amount: '-10000', balance: '640000' },
      { date: '2026-05-10', description: 'payroll', amount: '-10000', balance: '630000' },
      { date: '2026-05-20', description: 'supplies', amount: '-10000', balance: '620000' },
      { date: '2026-05-25', description: 'revenue e', amount: '40000', balance: '660000' },
    ];
    const result = scoreTransactions(safeRows);
    assert.equal(result.riskLevel, 'low');
  });

  it('flags when outflow exceeds inflow by 1.2x', () => {
    const rows = [
      { date: '2026-01-01', description: 'opening', amount: '100000', balance: '100000' },
      { date: '2026-02-01', description: 'expense', amount: '-80000', balance: '20000' },
    ];
    const result = scoreTransactions(rows);
    assert.ok(result.flags.some(f => f.includes('outflow')));
  });

  it('returns transaction count', () => {
    const result = scoreTransactions(sampleRows);
    assert.equal(result.transactionCount, 6);
  });
});
