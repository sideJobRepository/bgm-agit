export const protectedPrefixes = ['/write', '/setting', '/role', '/season'];

export const isProtectedPath = (pathname: string) =>
  protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
