import { Hello } from '../src';

test('My Greeter', () => {
  expect(Hello('Carl')).toBe('Hello Carl');
});