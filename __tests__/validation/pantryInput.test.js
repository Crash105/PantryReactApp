import { describe, it, expect } from 'vitest';

// Mirrors the validation in addItem (dashboard/page.js:128-137)
function validatePantryItem(item) {
  if (!item.trim()) return { valid: false, error: null };
  if (item.includes('/')) return { valid: false, error: "Item name cannot contain '/'." };
  if (item.length > 50) return { valid: false, error: "Item name cannot be more than 50 characters." };
  return { valid: true, error: null };
}

describe('pantry item input validation', () => {
  it('rejects items containing a forward slash', () => {
    const result = validatePantryItem('Chicken/Breast');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/\//);
  });

  it('rejects items with a slash at the start or end', () => {
    expect(validatePantryItem('/Chicken').valid).toBe(false);
    expect(validatePantryItem('Chicken/').valid).toBe(false);
  });

  it('rejects items longer than 50 characters', () => {
    const result = validatePantryItem('A'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/50 characters/i);
  });

  it('accepts an item name exactly 50 characters long', () => {
    expect(validatePantryItem('A'.repeat(50)).valid).toBe(true);
  });

  it('accepts valid item names', () => {
    expect(validatePantryItem('Chicken').valid).toBe(true);
    expect(validatePantryItem('Olive Oil').valid).toBe(true);
    expect(validatePantryItem('Salt & Pepper').valid).toBe(true);
  });

  it('rejects empty input', () => {
    expect(validatePantryItem('').valid).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    expect(validatePantryItem('   ').valid).toBe(false);
  });
});
