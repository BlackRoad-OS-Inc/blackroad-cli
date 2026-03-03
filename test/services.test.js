import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getAllServices, getServiceBySlug, getRailwayServices } from '../lib/services.js';

describe('services registry', () => {
  test('getAllServices returns a non-empty array', () => {
    const services = getAllServices();
    assert.ok(Array.isArray(services));
    assert.ok(services.length > 0);
  });

  test('each service has required fields', () => {
    const services = getAllServices();
    for (const svc of services) {
      assert.ok(typeof svc.name === 'string', `${svc.name}: name must be a string`);
      assert.ok(typeof svc.slug === 'string', `${svc.name}: slug must be a string`);
      assert.ok(typeof svc.url === 'string', `${svc.name}: url must be a string`);
      assert.ok(typeof svc.railway === 'boolean', `${svc.name}: railway must be a boolean`);
    }
  });

  test('getServiceBySlug returns the correct service', () => {
    const svc = getServiceBySlug('api');
    assert.ok(svc);
    assert.equal(svc.slug, 'api');
  });

  test('getServiceBySlug returns undefined for unknown slug', () => {
    const svc = getServiceBySlug('nonexistent-service');
    assert.equal(svc, undefined);
  });

  test('getRailwayServices returns only railway services', () => {
    const services = getRailwayServices();
    for (const svc of services) {
      assert.equal(svc.railway, true);
    }
  });

  test('service slugs are unique', () => {
    const services = getAllServices();
    const slugs = services.map(s => s.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(uniqueSlugs.size, slugs.length, 'service slugs must be unique');
  });
});
