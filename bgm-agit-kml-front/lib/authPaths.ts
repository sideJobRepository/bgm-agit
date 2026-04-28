export const protectedPrefixes = ['/write', '/setting', '/role'];

export const isProtectedPath = (pathname: string) =>
  protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
