import { db } from "./db";

// Session user type
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  isModerator: boolean;
}

/**
 * Get the current authenticated user from the session.
 *
 * TODO: Replace with NextAuth.js session when configured.
 * For now, this checks for a dev header or returns null.
 */
export async function getSession(request: Request): Promise<SessionUser | null> {
  // Development: allow passing user ID via header for testing
  if (process.env.NODE_ENV === "development") {
    const devUserId = request.headers.get("x-dev-user-id");
    if (devUserId) {
      const user = await db.user.findUnique({
        where: { id: devUserId },
        select: {
          id: true,
          username: true,
          email: true,
          isModerator: true,
        },
      });
      return user;
    }
  }

  // TODO: Implement NextAuth.js session retrieval
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) return null;
  // return db.user.findUnique({ where: { id: session.user.id } });

  return null;
}

/**
 * Require authentication - throws if not authenticated.
 * Returns the session user if authenticated.
 */
export async function requireAuth(request: Request): Promise<SessionUser> {
  const session = await getSession(request);
  if (!session) {
    throw new AuthError("Authentication required");
  }
  return session;
}

/**
 * Check if user is a moderator.
 */
export function isModerator(user: SessionUser): boolean {
  return user.isModerator;
}

/**
 * Check if user owns a resource or is a moderator.
 */
export function canModify(user: SessionUser, ownerId: string | null): boolean {
  if (user.isModerator) return true;
  if (!ownerId) return false;
  return user.id === ownerId;
}

// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
