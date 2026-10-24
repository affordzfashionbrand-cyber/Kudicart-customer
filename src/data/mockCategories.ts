export interface GenderCategory {
  id: 'all' | 'men' | 'women' | 'kids';
  name: string;
  image: string;
}

export const GENDER_CATEGORIES: GenderCategory[] = [
  {
    id: 'all',
    name: 'All',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'men',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'women',
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'kids',
    name: 'Kids',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80',
  },
];

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  image: string;
  badge?: string;
}

export const CATEGORY_STRIP_ITEMS: CategoryItem[] = [
  {
    id: 'beauty',
    name: 'Beauty',
    iconName: 'spa',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=160&auto=format&fit=crop&q=80',
    badge: 'NEW',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    iconName: 'hiking',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    iconName: 'watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'ethnic',
    name: 'Ethnic Wear',
    iconName: 'checkroom',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=160&auto=format&fit=crop&q=80',
    badge: 'HOT',
  },
  {
    id: 'western',
    name: 'Western Wear',
    iconName: 'styler',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'sports',
    name: 'Sports',
    iconName: 'fitness_center',
    image: 'https://images.unsplash.com/photo-1483721074573-586540da5703?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'watches',
    name: 'Watches',
    iconName: 'schedule',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'bags',
    name: 'Bags',
    iconName: 'shopping_bag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'jewellery',
    name: 'Jewellery',
    iconName: 'diamond',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&auto=format&fit=crop&q=80',
  },
];
