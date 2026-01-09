export interface BioPageData {
  slug: string;
  links: {
    shortUrl: string;
    label: string;
    destinationUrl: string;
    linkId: string;
  }[];
  userId: string;
  textColor: string;
  background?: {
    base: string;
    image?: {
      url: string;
      blur?: number;
      positionX?: number;
      positionY?: number;
      zoom?: number;
    };
  };
  avatarUrl: string;
  description?: string;
}
