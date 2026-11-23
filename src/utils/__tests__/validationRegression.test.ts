import { validateStreetNumber } from '../deliveryPointValidators';
import { calculateAgeFromBirthDate, validateEmailAddress } from '../formValidators';

describe('The street number validator', () => {
  it.each(['S/N', 'sn', '45-B', '2/3', 'Km. 4.5', '1'.repeat(50)])(
    'accepts supported street numbers',
    (value) => expect(validateStreetNumber(value)).toBeNull()
  );

  it.each(['', 'Km 4.', 'ABC', '1'.repeat(49) + '!', '1'.repeat(51)])(
    'rejects missing, invalid or overlong street numbers',
    (value) => expect(validateStreetNumber(value)).toEqual(expect.any(String))
  );
});

describe('The registration email validator', () => {
  it.each(['name@example.org', '   name@.example.org ', 'first.last@parts.example.org'])(
    'accepts the existing email forms',
    (value) => expect(validateEmailAddress(value).isValid).toBe(true)
  );

  it.each(['', 'a@b.', 'a@.b', 'a@@b.example', 'a b@example.org', 'a@' + 'a'.repeat(10000) + '.'])(
    'rejects incomplete or malformed email addresses',
    (value) => expect(validateEmailAddress(value).isValid).toBe(false)
  );
});

describe('The age calculation', () => {
  it('returns zero for empty or invalid dates', () => {
    expect(calculateAgeFromBirthDate('')).toBe(0);
    expect(calculateAgeFromBirthDate('invalid')).toBe(0);
  });

  it('returns an integer age for a valid birth date', () => {
    const age = calculateAgeFromBirthDate('1990-07-15');
    expect(Number.isInteger(age)).toBe(true);
    expect(age).toBeGreaterThan(18);
  });
});
