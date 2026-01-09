import { BioPageData } from './types';

export const demoBiopages: BioPageData[] = [
  {
    slug: 'sarah_design',
    userId: 'demo_user_1',
    textColor: '#1a1a1a',
    background: {
      base: 'linear-gradient(to bottom right, #eef2f3, #8e9eab)',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Senior UI/UX Designer | Building digital experiences that matter ✨',
    links: [
      {
        shortUrl: 'https://example.com/portfolio',
        label: 'View Portfolio',
        destinationUrl: 'https://dribbble.com',
        linkId: '1',
      },
      {
        shortUrl: 'https://example.com/course',
        label: 'Design Masterclass - 50% OFF',
        destinationUrl: 'https://teachable.com',
        linkId: '2',
      },
      {
        shortUrl: 'https://example.com/newsletter',
        label: 'Subscribe to Newsletter',
        destinationUrl: 'https://substack.com',
        linkId: '3',
      },
    ],
  },
  {
    slug: 'coffee_house',
    userId: 'demo_user_2',
    textColor: '#ffffff',
    background: {
      base: '#000000',
      image: {
        url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        blur: 3,
        positionX: 50,
        positionY: 50,
        zoom: 0,
      },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Artisanal Coffee Roasters ☕ | Since 2010 | Shipping Worldwide',
    links: [
      {
        shortUrl: 'https://example.com/shop',
        label: 'Shop Coffee Beans',
        destinationUrl: 'https://shopify.com',
        linkId: '4',
      },
      {
        shortUrl: 'https://example.com/subscriptions',
        label: 'Monthly Subscription',
        destinationUrl: 'https://example.com',
        linkId: '5',
      },
      {
        shortUrl: 'https://example.com/locations',
        label: 'Find a Cafe',
        destinationUrl: 'https://google.com/maps',
        linkId: '6',
      },
    ],
  },
  {
    slug: 'fitness_pro',
    userId: 'demo_user_3',
    textColor: '#ffffff',
    background: {
      base: 'linear-gradient(45deg, #111111 0%, #2c3e50 100%)',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Elite Performance Coach 💪 | Transform your body in 90 days',
    links: [
      {
        shortUrl: 'https://example.com/program',
        label: 'Start 90-Day Challenge',
        destinationUrl: 'https://example.com',
        linkId: '7',
      },
      {
        shortUrl: 'https://example.com/youtube',
        label: 'Free Workouts',
        destinationUrl: 'https://youtube.com',
        linkId: '8',
      },
      {
        shortUrl: 'https://example.com/supplements',
        label: 'Recommended Supplements',
        destinationUrl: 'https://example.com',
        linkId: '9',
      },
    ],
  },
  {
    slug: 'neon_blaze',
    userId: 'demo_user_4',
    textColor: '#00ff9d',
    background: {
      base: '#000000',
      image: {
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        blur: 0,
        positionX: 50,
        positionY: 50,
        zoom: 0,
      },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Gaming. Chaos. Vibes. 🎮🔥 | Live daily at 8PM EST',
    links: [
      {
        shortUrl: 'https://twitch.tv/neonblaze',
        label: '🔴 WATCH LIVE',
        destinationUrl: 'https://twitch.tv',
        linkId: '10',
      },
      {
        shortUrl: 'https://merch.com/neon',
        label: 'Limited Drop Merch 👕',
        destinationUrl: 'https://example.com',
        linkId: '11',
      },
      {
        shortUrl: 'https://discord.gg/neon',
        label: 'Join the Squad',
        destinationUrl: 'https://discord.com',
        linkId: '12',
      },
    ],
  },
  {
    slug: 'alex_metrics',
    userId: 'demo_user_5',
    textColor: '#f8fafc',
    background: {
      base: 'linear-gradient(to top, #0f172a, #334155)',
    },
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Data Scientist & Viz Wizard 📊 | Turning complex data into clear insights.',
    links: [
      {
        shortUrl: 'https://github.com/alexmetrics',
        label: 'GitHub Projects',
        destinationUrl: 'https://github.com',
        linkId: '13',
      },
      {
        shortUrl: 'https://medium.com/@alex',
        label: 'Read my Case Studies',
        destinationUrl: 'https://medium.com',
        linkId: '14',
      },
      {
        shortUrl: 'https://linkedin.com/in/alex',
        label: 'Connect on LinkedIn',
        destinationUrl: 'https://linkedin.com',
        linkId: '15',
      },
    ],
  },
  {
    slug: 'horizon_academy',
    userId: 'demo_user_6',
    textColor: '#ffffff',
    background: {
      base: '#003366',
      image: {
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        blur: 2,
        positionX: 50,
        positionY: 50,
        zoom: 0,
      },
    },
    avatarUrl: 'https://images.unsplash.com/photo-1592280771800-bcf9de2f3d91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Empowering future leaders through innovation and excellence. 🎓 | Admissions Open',
    links: [
      {
        shortUrl: 'https://horizon.edu/apply',
        label: 'Apply for Fall 2024',
        destinationUrl: 'https://example.com',
        linkId: '16',
      },
      {
        shortUrl: 'https://horizon.edu/programs',
        label: 'Explore Our Programs',
        destinationUrl: 'https://example.com',
        linkId: '17',
      },
      {
        shortUrl: 'https://horizon.edu/tour',
        label: 'Virtual Campus Tour',
        destinationUrl: 'https://example.com',
        linkId: '18',
      },
    ],
  },
];
