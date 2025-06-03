export { }

// Create a type for the roles
export type Roles = 'admin' | 'moderator'
export type AccountType = 'free' | 'premium'

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles,
            accountType?: AccountType
            expiresAt?: string
        }
    }
}
export type LinkType = {
    _id: string
    shortUrl: string
    shortId?: string
    originalUrl: string
}
export type LinkStat = {
    country: string,
    clicksCount: number
}

export type SelectedLink = {
    shortUrl: string
    shortId?: string
    label: string
}

export type BiopageType = {
    slug: string
    links: SelectedLink[]
    backgroundColor: string
    textColor: string
    avatarUrl?: string
}
