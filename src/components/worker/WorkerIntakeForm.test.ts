import { describe, test, expect } from 'vitest';
import { validateWorkerData } from './WorkerIntakeForm';

describe('WorkerIntakeForm Validation Logic', () => {
  test('empty fields trigger validation errors', () => {
    const emptyData = {
      name: '',
      phone: '',
      address: '',
      total_family_members: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      blood_group: '',
      medical_conditions: [],
      site_id: '',
    };

    const errors = validateWorkerData(emptyData);

    expect(errors.name).toBe('Name is required');
    expect(errors.phone).toBe('Phone number is required');
    expect(errors.address).toBe('Address is required');
    expect(errors.total_family_members).toBe('Family members count is required');
    expect(errors.emergency_contact_name).toBe('Emergency contact name is required');
    expect(errors.emergency_contact_phone).toBe('Emergency contact phone is required');
    expect(errors.site_id).toBe('Site assignment is required');
  });

  test('incorrect phone format triggers validation errors', () => {
    const invalidPhones = {
      name: 'Rohan Sharma',
      phone: '12345', // too short
      address: 'Kiln Site Sector A',
      total_family_members: '3',
      emergency_contact_name: 'Sita Sharma',
      emergency_contact_phone: 'abcdefghijk', // invalid chars
      blood_group: 'B+',
      medical_conditions: [],
      site_id: 'site-uuid-123',
    };

    const errors = validateWorkerData(invalidPhones);

    expect(errors.phone).toBe('Invalid format (10-15 digits required)');
    expect(errors.emergency_contact_phone).toBe('Invalid format (10-15 digits required)');
    expect(errors.name).toBeUndefined();
    expect(errors.address).toBeUndefined();
  });

  test('negative/non-integer family counts trigger validation errors', () => {
    const negativeFamily = {
      name: 'Rohan Sharma',
      phone: '9876543210',
      address: 'Kiln Site Sector A',
      total_family_members: '-2', // negative
      emergency_contact_name: 'Sita Sharma',
      emergency_contact_phone: '9876543211',
      blood_group: 'B+',
      medical_conditions: [],
      site_id: 'site-uuid-123',
    };

    const floatFamily = {
      ...negativeFamily,
      total_family_members: '2.5', // non-integer
    };

    const errorsNegative = validateWorkerData(negativeFamily);
    const errorsFloat = validateWorkerData(floatFamily);

    expect(errorsNegative.total_family_members).toBe('Must be a non-negative integer');
    expect(errorsFloat.total_family_members).toBe('Must be a non-negative integer');
  });

  test('valid data passes all validations', () => {
    const validData = {
      name: 'Rohan Sharma',
      phone: '+919876543210',
      address: 'Kiln Site Sector A',
      total_family_members: '0', // 0 is non-negative
      emergency_contact_name: 'Sita Sharma',
      emergency_contact_phone: '9876543211',
      blood_group: 'O-',
      medical_conditions: ['Asthma'],
      site_id: 'site-uuid-123',
    };

    const errors = validateWorkerData(validData);

    expect(Object.keys(errors).length).toBe(0);
  });
});
