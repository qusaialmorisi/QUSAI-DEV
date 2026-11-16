import { describe, it, expect } from 'vitest';
import {
  calculateIPv4Details,
  calculateIpRange,
  calculateSubnet,
  cidrToMaskUint32,
  compressIPv6,
  expandIPv6,
  getIPv6Details,
  getSubnetMaskDetails,
  ipv4ToUint32,
  isValidIPv4,
  isValidSubnetMask,
  maskToCidr,
  parseCidrPrefix,
  splitSubnet,
  uint32ToIpv4,
  validateIpAddress,
} from '../utils/networkMath';

describe('IPv4 validation and bitwise conversions', () => {
  it('validates dotted-quad IPv4 addresses strictly', () => {
    expect(isValidIPv4('192.168.1.1')).toBe(true);
    expect(isValidIPv4('0.0.0.0')).toBe(true);
    expect(isValidIPv4('255.255.255.255')).toBe(true);
    expect(isValidIPv4(' 10.0.0.5 ')).toBe(true);

    expect(isValidIPv4('')).toBe(false);
    expect(isValidIPv4('256.0.0.1')).toBe(false);
    expect(isValidIPv4('192.168.01.1')).toBe(false);
    expect(isValidIPv4('192.168.1')).toBe(false);
    expect(isValidIPv4('192.168.1.1.1')).toBe(false);
    expect(isValidIPv4('abc.def.0.1')).toBe(false);
  });

  it('round-trips IPv4 to uint32 and dotted-decimal', () => {
    expect(ipv4ToUint32('192.168.10.42')).toBe(3232238122);
    expect(uint32ToIpv4(3232238122)).toBe('192.168.10.42');
    expect(ipv4ToUint32('255.255.255.255')).toBe(4294967295);
    expect(uint32ToIpv4(0)).toBe('0.0.0.0');
  });

  it('computes binary, hex, class, scope, and PTR for IPv4 addresses', () => {
    const priv = calculateIPv4Details('192.168.10.42');
    expect(priv).not.toBeNull();
    expect(priv?.ipClass).toBe('C');
    expect(priv?.scopeKey).toBe('private');
    expect(priv?.binaryDotted).toBe('11000000.10101000.00001010.00101010');
    expect(priv?.hexDotted).toBe('C0:A8:0A:2A');
    expect(priv?.reverseDns).toBe('42.10.168.192.in-addr.arpa');

    expect(calculateIPv4Details('127.0.0.1')?.scopeKey).toBe('loopback');
    expect(calculateIPv4Details('100.64.12.8')?.scopeKey).toBe('cgnat');
    expect(calculateIPv4Details('8.8.8.8')?.scopeKey).toBe('public');
    expect(calculateIPv4Details('')).toBeNull();
    expect(calculateIPv4Details('999.1.1.1')).toBeNull();
  });
});

describe('CIDR and subnet masks', () => {
  it('converts between CIDR prefixes and contiguous subnet masks', () => {
    expect(uint32ToIpv4(cidrToMaskUint32(0))).toBe('0.0.0.0');
    expect(uint32ToIpv4(cidrToMaskUint32(24))).toBe('255.255.255.0');
    expect(uint32ToIpv4(cidrToMaskUint32(26))).toBe('255.255.255.192');
    expect(uint32ToIpv4(cidrToMaskUint32(32))).toBe('255.255.255.255');

    expect(maskToCidr('255.255.255.0')).toBe(24);
    expect(maskToCidr('255.255.240.0')).toBe(20);
    expect(maskToCidr('0.0.0.0')).toBe(0);
    expect(maskToCidr('255.255.255.255')).toBe(32);

    // Non-contiguous masks must be rejected
    expect(isValidSubnetMask('255.0.255.0')).toBe(false);
    expect(isValidSubnetMask('255.255.255.1')).toBe(false);
    expect(maskToCidr('255.0.255.0')).toBeNull();
    expect(maskToCidr('')).toBeNull();
  });

  it('parses and validates manual CIDR prefix strings', () => {
    expect(parseCidrPrefix('24')).toEqual({ valid: true, value: 24 });
    expect(parseCidrPrefix('/0')).toEqual({ valid: true, value: 0 });
    expect(parseCidrPrefix('/32')).toEqual({ valid: true, value: 32 });
    expect(parseCidrPrefix('   ')).toEqual({ valid: false, value: null, errorKey: 'empty' });
    expect(parseCidrPrefix('33')).toEqual({ valid: false, value: null, errorKey: 'invalidCidr' });
    expect(parseCidrPrefix('-1')).toEqual({ valid: false, value: null, errorKey: 'invalidCidr' });
    expect(parseCidrPrefix('abc')).toEqual({ valid: false, value: null, errorKey: 'invalidCidr' });
  });

  it('returns exact mask details including host and network counts', () => {
    const d24 = getSubnetMaskDetails(24);
    expect(d24?.subnetMask).toBe('255.255.255.0');
    expect(d24?.wildcardMask).toBe('0.0.0.255');
    expect(d24?.totalAddresses).toBe(256);
    expect(d24?.usableHosts).toBe(254);

    expect(getSubnetMaskDetails(31)?.usableHosts).toBe(2);
    expect(getSubnetMaskDetails(32)?.usableHosts).toBe(1);
    expect(getSubnetMaskDetails(-1)).toBeNull();
    expect(getSubnetMaskDetails(33)).toBeNull();
  });
});

describe('Network, broadcast, subnet splitting, and IP range calculations', () => {
  it('calculates network, broadcast, and usable host ranges accurately', () => {
    const sub = calculateSubnet('192.168.45.77', 26);
    expect(sub).not.toBeNull();
    expect(sub?.networkAddress).toBe('192.168.45.64');
    expect(sub?.broadcastAddress).toBe('192.168.45.127');
    expect(sub?.firstUsableHost).toBe('192.168.45.65');
    expect(sub?.lastUsableHost).toBe('192.168.45.126');
    expect(sub?.usableHosts).toBe(62);
    expect(sub?.totalAddresses).toBe(64);
    expect(sub?.wildcardMask).toBe('0.0.0.63');
  });

  it('handles RFC 3021 /31 point-to-point and /32 host routes', () => {
    const p2p = calculateSubnet('10.0.0.2', 31);
    expect(p2p?.isPointToPoint).toBe(true);
    expect(p2p?.usableHosts).toBe(2);
    expect(p2p?.firstUsableHost).toBe('10.0.0.2');
    expect(p2p?.lastUsableHost).toBe('10.0.0.3');

    const host = calculateSubnet('10.0.0.9', 32);
    expect(host?.isHostRoute).toBe(true);
    expect(host?.usableHosts).toBe(1);
    expect(host?.firstUsableHost).toBe('10.0.0.9');
    expect(host?.lastUsableHost).toBe('10.0.0.9');

    expect(calculateSubnet('999.0.0.1', 24)).toBeNull();
    expect(calculateSubnet('10.0.0.1', 33)).toBeNull();
  });

  it('splits a base subnet cleanly into smaller child subnets', () => {
    const rows = splitSubnet('10.20.40.15', 24, 26);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      index: 1,
      network: '10.20.40.0',
      cidr: 26,
      firstHost: '10.20.40.1',
      lastHost: '10.20.40.62',
      broadcast: '10.20.40.63',
      usableHosts: 62,
    });
    expect(rows[3].network).toBe('10.20.40.192');
    expect(rows[3].broadcast).toBe('10.20.40.255');
  });

  it('summarizes IPv4 ranges into minimal CIDR blocks and rejects invalid ranges', () => {
    const res = calculateIpRange('192.168.10.0', '192.168.10.191');
    expect(res.valid).toBe(true);
    expect(res.totalAddresses).toBe(192);
    expect(res.cidrs.map((c) => c.cidrNotation)).toEqual([
      '192.168.10.0/25',
      '192.168.10.128/26',
    ]);

    const inverted = calculateIpRange('192.168.10.50', '192.168.10.10');
    expect(inverted.valid).toBe(false);
    expect(inverted.errorKey).toBe('inverted');

    const invalid = calculateIpRange('', '192.168.10.10');
    expect(invalid.valid).toBe(false);
    expect(invalid.errorKey).toBe('invalidIp');
  });
});

describe('IPv6 validation, expansion, and RFC 5952 compression', () => {
  it('expands and compresses standard and IPv4-mapped IPv6 addresses', () => {
    expect(expandIPv6('2001:db8::1')).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(compressIPv6('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8::1');
    expect(expandIPv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1');

    const mapped = getIPv6Details('::ffff:192.0.2.128');
    expect(mapped?.valid).toBe(true);
    expect(mapped?.scopeKey).toBe('ipv4mapped');
    expect(mapped?.embeddedIpv4).toBe('192.0.2.128');
  });

  it('rejects malformed and empty IPv6 inputs', () => {
    expect(expandIPv6('')).toBeNull();
    expect(expandIPv6('2001::db8::1')).toBeNull();
    expect(expandIPv6('2001:::1')).toBeNull();
    expect(expandIPv6('gggg::1')).toBeNull();
    expect(getIPv6Details('1234:5678')).toBeNull();
  });

  it('validates unified IPv4 / IPv6 addresses via validateIpAddress', () => {
    expect(validateIpAddress('172.16.40.1')).toMatchObject({
      valid: true,
      version: 'IPv4',
      scopeKey: 'private',
    });
    expect(validateIpAddress('fe80::1')).toMatchObject({
      valid: true,
      version: 'IPv6',
      scopeKey: 'linkLocal',
    });
    expect(validateIpAddress('   ')).toMatchObject({
      valid: false,
      version: 'Invalid',
      scopeKey: 'empty',
    });
    expect(validateIpAddress('999.999.1.1')).toMatchObject({
      valid: false,
      version: 'Invalid',
      scopeKey: 'invalid',
    });
  });
});
