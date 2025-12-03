import { vi, describe, it, expect } from 'vitest';
import { useBookmarks } from '@/hooks/useBookmarks';

vi.mock('@/hooks/useBookmarks', () => ({
    useBookmarks: vi.fn(),
}));

describe('debug', () => {
    it('mocks useBookmarks', () => {
        (useBookmarks as any).mockReturnValue({ foo: 'bar' });
        const result = useBookmarks('program', '123');
        expect(result).toEqual({ foo: 'bar' });
    });
});
