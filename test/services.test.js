import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllServices, getServiceBySlug, getRailwayServices, services } from '../lib/services.js';

describe('services library', () => {
  describe('getAllServices()', () => {
    it('returns a non-empty array', () => {
      const all = getAllServices();
      assert.ok(Array.isArray(all));
      assert.ok(all.length > 0);
    });

    it('every service has required fields', () => {
      for (const svc of getAllServices()) {
        assert.ok(typeof svc.name === 'string', `${svc.slug} missing name`);
        assert.ok(typeof svc.slug === 'string', `${svc.name} missing slug`);
        assert.ok(typeof svc.url === 'string', `${svc.name} missing url`);
        assert.ok(typeof svc.railway === 'boolean', `${svc.name} missing railway flag`);
      }
    });

    it('includes core services', () => {
      const slugs = getAllServices().map(s => s.slug);
      assert.ok(slugs.includes('api'), 'api service missing');
    });
  });

  describe('getServiceBySlug()', () => {
    it('finds a known service by slug', () => {
      const svc = getServiceBySlug('api');
      assert.ok(svc);
      assert.equal(svc.slug, 'api');
    });

    it('returns undefined for unknown slug', () => {
      const svc = getServiceBySlug('no-such-service');
      assert.equal(svc, undefined);
    });
  });

  describe('getRailwayServices()', () => {
    it('returns only railway-hosted services', () => {
      const railway = getRailwayServices();
      assert.ok(railway.length > 0);
      for (const svc of railway) {
        assert.equal(svc.railway, true, `${svc.name} should be railway=true`);
      }
    });
  });

  describe('services registry', () => {
    it('has core, infrastructure, services, and web categories', () => {
      assert.ok(Array.isArray(services.core));
      assert.ok(Array.isArray(services.infrastructure));
      assert.ok(Array.isArray(services.services));
      assert.ok(Array.isArray(services.web));
    });
  });
});
