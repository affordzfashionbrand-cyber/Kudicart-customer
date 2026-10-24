export interface QuickCollection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
}

export const QUICK_COLLECTIONS: QuickCollection[] = [
  {
    id: 'qc-1',
    title: 'New Brands',
    subtitle: 'Just Launched',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80',
    badge: 'NEW',
  },
  {
    id: 'qc-2',
    title: 'Fresh Drops',
    subtitle: 'New Collection',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
    badge: 'FRESH',
  },
  {
    id: 'qc-3',
    title: 'Best Sellers',
    subtitle: 'Popular Picks',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80',
    badge: 'HOT',
  },
  {
    id: 'qc-4',
    title: 'Clearance Sale',
    subtitle: 'Final Call',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80',
    badge: 'UP TO 70%',
  },
  {
    id: 'qc-5',
    title: 'Trending Now',
    subtitle: 'Most Wanted',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'qc-6',
    title: 'Festive Edit',
    subtitle: 'Latest Styles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    badge: 'EXCLUSIVE',
  },
];

export interface TrendingStory {
  id: string;
  hashtag: string;
  title: string;
  subtitle: string;
  image: string;
  tagColor: string;
}

export const TRENDING_STORIES: TrendingStory[] = [
  {
    id: 'ts-1',
    hashtag: '#NavratriReady',
    title: 'Flared Silk Anarkalis',
    subtitle: 'Hand-dyed mirror embroidery & twirl-worthy flair',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    tagColor: '#111111',
  },
  {
    id: 'ts-2',
    hashtag: '#ChikankariCraft',
    title: 'Pure White Cotton Kurtis',
    subtitle: 'Centuries-old Lucknow shadow-work embroidery',
    image: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?w=600&auto=format&fit=crop&q=80',
    tagColor: '#C2410C',
  },
  {
    id: 'ts-3',
    hashtag: '#StreetCulture',
    title: 'Drop-Shoulder Boxy Tees',
    subtitle: 'Heavyweight loopback cotton & minimal typography',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    tagColor: '#1E293B',
  },
  {
    id: 'ts-4',
    hashtag: '#OfficeSharp',
    title: 'Breathable Linen Ensembles',
    subtitle: 'Stay composed with premium crease-resistant weaves',
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600&auto=format&fit=crop&q=80',
    tagColor: '#059669',
  },
];
