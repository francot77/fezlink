export { }

// Create a type for the roles
export type Roles = 'admin' | 'moderator'
export type accountType = 'free' | 'premium'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles,
            accountType?: accountType
        }
    }
}