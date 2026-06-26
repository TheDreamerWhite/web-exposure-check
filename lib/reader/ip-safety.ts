import "server-only";

import { lookup } from "node:dns/promises";
import net from "node:net";

function ipv4ToNumber(address: string) {
  const parts = address.split(".").map((part) => Number(part));

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    parts[3]
  );
}

function isInIpv4Range(address: string, base: string, prefixLength: number) {
  const value = ipv4ToNumber(address);
  const baseValue = ipv4ToNumber(base);

  if (value === null || baseValue === null) {
    return false;
  }

  const mask =
    prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;

  return (value & mask) === (baseValue & mask);
}

function getMappedIpv4Address(address: string) {
  const normalized = address.toLowerCase();
  const match = normalized.match(
    /^(?:::ffff:|0:0:0:0:0:ffff:)(\d{1,3}(?:\.\d{1,3}){3})$/
  );

  return match?.[1] || null;
}

export function isBlockedIpAddress(address: string) {
  const cleanedAddress = address.replace(/^\[|\]$/g, "").toLowerCase();
  const mappedIpv4 = getMappedIpv4Address(cleanedAddress);

  if (mappedIpv4) {
    return isBlockedIpAddress(mappedIpv4);
  }

  if (net.isIPv4(cleanedAddress)) {
    return (
      isInIpv4Range(cleanedAddress, "0.0.0.0", 8) ||
      isInIpv4Range(cleanedAddress, "10.0.0.0", 8) ||
      isInIpv4Range(cleanedAddress, "100.64.0.0", 10) ||
      isInIpv4Range(cleanedAddress, "127.0.0.0", 8) ||
      isInIpv4Range(cleanedAddress, "169.254.0.0", 16) ||
      isInIpv4Range(cleanedAddress, "172.16.0.0", 12) ||
      isInIpv4Range(cleanedAddress, "192.168.0.0", 16) ||
      isInIpv4Range(cleanedAddress, "198.18.0.0", 15) ||
      isInIpv4Range(cleanedAddress, "224.0.0.0", 4) ||
      isInIpv4Range(cleanedAddress, "240.0.0.0", 4) ||
      cleanedAddress === "255.255.255.255"
    );
  }

  if (net.isIPv6(cleanedAddress)) {
    if (cleanedAddress === "::" || cleanedAddress === "::1") {
      return true;
    }

    const firstGroup = cleanedAddress.startsWith("::")
      ? 0
      : Number.parseInt(cleanedAddress.split(":")[0] || "0", 16);

    return (
      firstGroup === 0 ||
      (firstGroup >= 0xfc00 && firstGroup <= 0xfdff) ||
      (firstGroup >= 0xfe80 && firstGroup <= 0xfebf) ||
      (firstGroup >= 0xff00 && firstGroup <= 0xffff)
    );
  }

  return true;
}

export function isBlockedHostname(hostname: string) {
  const normalizedHostname = hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();

  if (!normalizedHostname) {
    return true;
  }

  if (net.isIP(normalizedHostname)) {
    return isBlockedIpAddress(normalizedHostname);
  }

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname === "host.docker.internal"
  ) {
    return true;
  }

  return !normalizedHostname.includes(".");
}

export async function assertPublicUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs can be read.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with usernames or passwords cannot be read.");
  }

  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new Error("Custom ports are not supported for website reading.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");

  if (isBlockedHostname(hostname)) {
    throw new Error("Only public website hostnames can be read.");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIpAddress(hostname)) {
      throw new Error("Private, local, or reserved IP addresses cannot be read.");
    }

    return;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0) {
    throw new Error("The website hostname did not resolve to an address.");
  }

  const blockedAddress = addresses.find((address) =>
    isBlockedIpAddress(address.address)
  );

  if (blockedAddress) {
    throw new Error("The website resolves to a private, local, or reserved address.");
  }
}
