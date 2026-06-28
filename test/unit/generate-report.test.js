import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeScoreForReport } from '../../functions/generate-report/index.js';
import { sanitizeErrorMessage } from '../../functions/config/index.js';

describe('safeScoreForReport', () => {
  it('strips transactions from a score object', () => {
    const score = {
      balance: 1000000,
      flags: ['flag1'],
      transactions: [{ amount: 500 }],
      metrics: { burnRate: 1000 },
    };
    const result = safeScoreForReport(score);
    assert.equal(result.balance, 1000000);
    assert.deepEqual(result.flags, ['flag1']);
    assert.equal(result.transactions, undefined);
    assert.equal(result.metrics.burnRate, 1000);
  });

  it('handles null score', () => {
    const result = safeScoreForReport(null);
    assert.deepEqual(result, {});
  });

  it('handles undefined score', () => {
    const result = safeScoreForReport(undefined);
    assert.deepEqual(result, {});
  });

  it('does not mutate the original object', () => {
    const score = { balance: 500, transactions: [{ amount: 100 }] };
    const originalTx = score.transactions;
    safeScoreForReport(score);
    assert.equal(score.transactions, originalTx);
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
  it('trims whitespace', () => {
    assert.equal(sanitizeErrorMessage('  some error  '), 'some error');
  });
  it('truncates long messages', () => {
    const long = 'a'.repeat(250);
    const result = sanitizeErrorMessage(long);
    assert.equal(result.length, 203);
    assert.equal(result.endsWith('...'), true);
  });
});
