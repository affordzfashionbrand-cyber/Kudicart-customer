export interface ExploreCategoryDef {
  id: string;
  name: string;
  wear: string;
  image: string;
  tagline: string;
  subcategories: string[];
}

export const EXPLORE_CATEGORIES: ExploreCategoryDef[] = [
  {
    id: 'All',
    name: 'All Styles',
    wear: 'All',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
    tagline: 'Complete archive of artisanal and modern silhouettes',
    subcategories: ['All', 'New Drops', 'Bestsellers', 'Handlooms', 'Minimalism'],
  },
  {
    id: 'Ethnic',
    name: 'Ethnic Wear',
    wear: 'Ethnic',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    tagline: 'Handloom Sarees, Zari weaves & Chanderi Kurta sets',
    subcategories: ['All Ethnic', 'Sarees', 'Anarkali Sets', 'Kurta Sets', 'Handlooms', 'Raw Silk'],
  },
  {
    id: 'Western',
    name: 'Western Wear',
    wear: 'Western',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    tagline: 'Relaxed wool coats, tailored trousers & fluid dresses',
    subcategories: ['All Western', 'Coats & Outerwear', 'Dresses', 'Tailored Cuts', 'Knits'],
  },
  {
    id: 'Tops',
    name: 'Topwear',
    wear: 'Tops',
    image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=400&q=80',
    tagline: 'Structured shirts, Breton organic tees & overshirts',
    subcategories: ['All Tops', 'Structured Shirts', 'Overshirts', 'Organic Tees', 'Linen'],
  },
  {
    id: 'Bottoms',
    name: 'Bottomwear',
    wear: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
    tagline: 'Raw selvedge denim, wide-leg linen pants & chinos',
    subcategories: ['All Bottoms', 'Selvedge Denim', 'Wide-Leg Trousers', 'Relaxed Chinos'],
  },
  {
    id: 'Footwear',
    name: 'Footwear',
    wear: 'Footwear',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
    tagline: 'Italian leather sneakers, court runners & loafers',
    subcategories: ['All Shoes', 'Leather Sneakers', 'Court Runners', 'Artisan Loafers'],
  },
  {
    id: 'Accessories',
    name: 'Accessories',
    wear: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    tagline: 'Hand-burnished leather totes, silk scarves & belts',
    subcategories: ['All Accessories', 'Leather Totes', 'Silk Scarves', 'Belts', 'Wallets'],
  },
];

export const GENDER_TABS: { id: 'All' | 'Men' | 'Women' | 'Kids'; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Women', label: 'Women' },
  { id: 'Men', label: 'Men' },
  { id: 'Kids', label: 'Kids' },
];
