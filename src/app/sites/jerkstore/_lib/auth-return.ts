// Only language landing pages can override the usual post-login destination.
// A strict public-path shape excludes external URLs, queries and encoded paths.
export function signInDestination(returnTo: string | null | undefined) {
  return returnTo && /^\/ai-insults\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(returnTo)
    ? returnTo
    : "/app";
}

export function authCallback(destination: string, result: "login" | "signup", provider: "google" | "email") {
  return `${destination}?auth_result=${result}&auth_provider=${provider}`;
}
