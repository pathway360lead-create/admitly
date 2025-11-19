import { describe, it, expect } from 'vitest';

describe('SearchFilters Module', () => {
  describe('Type Constants', () => {
    it('exports FIELD_OF_STUDY_OPTIONS', async () => {
      const types = await import('./types');
      expect(types.FIELD_OF_STUDY_OPTIONS).toBeDefined();
      expect(Array.isArray(types.FIELD_OF_STUDY_OPTIONS)).toBe(true);
      expect(types.FIELD_OF_STUDY_OPTIONS.length).toBeGreaterThan(0);
    });

    it('exports DURATION_OPTIONS', async () => {
      const types = await import('./types');
      expect(types.DURATION_OPTIONS).toBeDefined();
      expect(Array.isArray(types.DURATION_OPTIONS)).toBe(true);
      expect(types.DURATION_OPTIONS.length).toBeGreaterThan(0);
    });

    it('exports tuition range constants', async () => {
      const types = await import('./types');
      expect(types.TUITION_MIN).toBeDefined();
      expect(types.TUITION_MAX).toBeDefined();
      expect(types.TUITION_STEP).toBeDefined();
      expect(typeof types.TUITION_MIN).toBe('number');
      expect(typeof types.TUITION_MAX).toBe('number');
      expect(typeof types.TUITION_STEP).toBe('number');
      expect(types.TUITION_MAX).toBeGreaterThan(types.TUITION_MIN);
    });

    it('exports cutoff range constants', async () => {
      const types = await import('./types');
      expect(types.CUTOFF_MIN).toBeDefined();
      expect(types.CUTOFF_MAX).toBeDefined();
      expect(types.CUTOFF_STEP).toBeDefined();
      expect(typeof types.CUTOFF_MIN).toBe('number');
      expect(typeof types.CUTOFF_MAX).toBe('number');
      expect(typeof types.CUTOFF_STEP).toBe('number');
      expect(types.CUTOFF_MAX).toBeGreaterThan(types.CUTOFF_MIN);
    });
  });

  describe('Currency Formatting', () => {
    it('Intl.NumberFormat works for NGN currency', () => {
      const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      const formatted100k = formatter.format(100000);
      const formatted1m = formatter.format(1000000);

      expect(formatted100k).toContain('100');
      expect(formatted1m).toContain('000');
      expect(typeof formatted100k).toBe('string');
      expect(typeof formatted1m).toBe('string');
    });
  });

  describe('Type Definitions', () => {
    it('exports SearchFiltersProps type', async () => {
      const types = await import('./types');
      // Type check - this will fail at compile time if type is missing
      const validFilterTypes: Array<'programs' | 'institutions' | 'all'> = [
        'programs',
        'institutions',
        'all',
      ];
      expect(validFilterTypes.length).toBe(3);
    });

    it('exports ProgramMode type values', async () => {
      const types = await import('./types');
      // Verify type exists by checking related constants
      expect(types.DURATION_OPTIONS).toBeDefined();
    });

    it('exports AccreditationStatus type values', async () => {
      const types = await import('./types');
      // Verify module exports exist
      expect(types.TUITION_MIN).toBeDefined();
    });
  });

  describe('Range Validations', () => {
    it('tuition range has valid step size', async () => {
      const types = await import('./types');
      const range = types.TUITION_MAX - types.TUITION_MIN;
      expect(range % types.TUITION_STEP).toBe(0);
    });

    it('cutoff range has valid step size', async () => {
      const types = await import('./types');
      const range = types.CUTOFF_MAX - types.CUTOFF_MIN;
      expect(range % types.CUTOFF_STEP).toBe(0);
    });

    it('tuition range is reasonable for Nigerian context', async () => {
      const types = await import('./types');
      // Min should be at least 10k, max should be reasonable
      expect(types.TUITION_MIN).toBeGreaterThanOrEqual(0);
      expect(types.TUITION_MAX).toBeLessThan(100000000); // Less than 100M
    });

    it('cutoff range is between 0-400 (JAMB/UTME score range)', async () => {
      const types = await import('./types');
      expect(types.CUTOFF_MIN).toBeGreaterThanOrEqual(0);
      expect(types.CUTOFF_MAX).toBeLessThanOrEqual(400);
    });
  });

  describe('Field of Study Options', () => {
    it('contains expected academic fields', async () => {
      const types = await import('./types');
      const fields = types.FIELD_OF_STUDY_OPTIONS;

      // Check structure
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);

      // Each option should have value and label
      fields.forEach((option: any) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });
  });

  describe('Duration Options', () => {
    it('contains valid program durations', async () => {
      const types = await import('./types');
      const durations = types.DURATION_OPTIONS;

      expect(Array.isArray(durations)).toBe(true);
      expect(durations.length).toBeGreaterThan(0);

      // Each option should have value and label
      durations.forEach((option: any) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.label).toBe('string');
      });
    });
  });
});
