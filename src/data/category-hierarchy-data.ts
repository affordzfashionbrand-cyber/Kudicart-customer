export interface SubSubCategoryDef {
  id: string;
  name: string;
  slug: string;
  level: 3;
  countText: string;
  icon: string;
  image: string;
  gender: 'Women' | 'Men' | 'Kids' | 'Unisex';
}

export interface SubCategoryDef {
  id: string;
  name: string;
  slug: string;
  level: 2;
  countText: string;
  icon: string;
  image: string;
  banner?: string;
  gender: 'Women' | 'Men' | 'Kids' | 'Unisex';
  subcategories: SubSubCategoryDef[];
  children?: SubSubCategoryDef[];
}

export interface DepartmentCategoryDef {
  id: string;
  name: string;
  slug: string;
  level: 1;
  countText: string;
  icon: string;
  image: string;
  banner: string;
  gender: 'Women' | 'Men' | 'Kids' | 'Unisex';
  badge?: string;
  subcategories: SubCategoryDef[];
  children?: SubCategoryDef[];
}

export const COMPLETE_CATEGORY_HIERARCHY: DepartmentCategoryDef[] = [
  // =========================================================================
  // 1. WOMEN'S DEPARTMENT
  // =========================================================================
  {
    id: 'cat-women',
    name: 'Women',
    slug: 'women',
    level: 1,
    countText: '4,850+ styles',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    gender: 'Women',
    badge: 'TRENDING ATELIER',
    subcategories: [
      {
        id: 'sub-women-ethnic',
        name: 'Indian & Fusion Wear',
        slug: 'women-ethnic',
        level: 2,
        countText: '1,820+ styles',
        icon: 'Crown',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
        gender: 'Women',
        subcategories: [
          {
            id: 'kurtis',
            name: 'Kurtas & Kurtis',
            slug: 'kurtis',
            level: 3,
            countText: '420+ styles',
            icon: 'styler',
            image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-kurtasets',
            name: 'Kurta Sets & Suits',
            slug: 'women-kurtasets',
            level: 3,
            countText: '580+ styles',
            icon: 'Sparkles',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'sarees',
            name: 'Handloom Sarees',
            slug: 'sarees',
            level: 3,
            countText: '380+ styles',
            icon: 'dry_cleaning',
            image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-anarkali',
            name: 'Anarkali Sets',
            slug: 'women-anarkali',
            level: 3,
            countText: '240+ styles',
            icon: 'Star',
            image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-palazzos',
            name: 'Palazzos & Skirts',
            slug: 'women-palazzos',
            level: 3,
            countText: '180+ styles',
            icon: 'Layers',
            image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-dupattas',
            name: 'Dupattas & Shawls',
            slug: 'women-dupattas',
            level: 3,
            countText: '140+ styles',
            icon: 'Sparkles',
            image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
        ],
      },
      {
        id: 'sub-women-western',
        name: 'Western Wear',
        slug: 'women-western',
        level: 2,
        countText: '1,450+ styles',
        icon: 'Layers',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80',
        gender: 'Women',
        subcategories: [
          {
            id: 'dresses',
            name: 'Dresses & Jumpsuits',
            slug: 'dresses',
            level: 3,
            countText: '490+ styles',
            icon: 'woman',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'tops',
            name: 'Tops & Tees',
            slug: 'tops',
            level: 3,
            countText: '360+ styles',
            icon: 'checkroom',
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-jeans',
            name: 'Jeans & Jeggings',
            slug: 'women-jeans',
            level: 3,
            countText: '280+ styles',
            icon: 'Sliders',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-trousers',
            name: 'Trousers & Chinos',
            slug: 'women-trousers',
            level: 3,
            countText: '220+ styles',
            icon: 'Sliders',
            image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-jackets',
            name: 'Blazers & Jackets',
            slug: 'women-jackets',
            level: 3,
            countText: '150+ styles',
            icon: 'Package',
            image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
        ],
      },
      {
        id: 'sub-women-footwear',
        name: "Women's Footwear",
        slug: 'women-footwear',
        level: 2,
        countText: '680+ styles',
        icon: 'Footprints',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
        gender: 'Women',
        subcategories: [
          {
            id: 'leaf-women-flats',
            name: 'Flats & Sliders',
            slug: 'women-flats',
            level: 3,
            countText: '280+ styles',
            icon: 'Footprints',
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-heels',
            name: 'Heels & Pumps',
            slug: 'women-heels',
            level: 3,
            countText: '220+ styles',
            icon: 'Footprints',
            image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-sneakers',
            name: 'Casual Sneakers',
            slug: 'women-sneakers',
            level: 3,
            countText: '180+ styles',
            icon: 'Footprints',
            image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
        ],
      },
      {
        id: 'sub-women-bags',
        name: 'Handbags & Clutches',
        slug: 'women-bags',
        level: 2,
        countText: '480+ styles',
        icon: 'ShoppingBag',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
        gender: 'Women',
        subcategories: [
          {
            id: 'leaf-women-totes',
            name: 'Leather Totes',
            slug: 'women-totes',
            level: 3,
            countText: '190+ styles',
            icon: 'ShoppingBag',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-women-slings',
            name: 'Crossbody & Slings',
            slug: 'women-slings',
            level: 3,
            countText: '160+ styles',
            icon: 'ShoppingBag',
            image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. MEN'S DEPARTMENT
  // =========================================================================
  {
    id: 'cat-men',
    name: 'Men',
    slug: 'men',
    level: 1,
    countText: '3,420+ styles',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1200&q=80',
    gender: 'Men',
    badge: 'CLASSIC STUDIO',
    subcategories: [
      {
        id: 'sub-men-topwear',
        name: 'Topwear',
        slug: 'men-topwear',
        level: 2,
        countText: '1,280+ styles',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
        gender: 'Men',
        subcategories: [
          {
            id: 'leaf-men-tshirts',
            name: 'T-Shirts (Crew & Oversized)',
            slug: 'men-tshirts',
            level: 3,
            countText: '520+ styles',
            icon: 'Shirt',
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-casualshirts',
            name: 'Casual Shirts',
            slug: 'men-casualshirts',
            level: 3,
            countText: '390+ styles',
            icon: 'Shirt',
            image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-formalshirts',
            name: 'Formal Dress Shirts',
            slug: 'men-formalshirts',
            level: 3,
            countText: '210+ styles',
            icon: 'Briefcase',
            image: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-hoodies',
            name: 'Sweatshirts & Hoodies',
            slug: 'men-hoodies',
            level: 3,
            countText: '180+ styles',
            icon: 'Layers',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
        ],
      },
      {
        id: 'sub-men-bottomwear',
        name: 'Bottomwear',
        slug: 'men-bottomwear',
        level: 2,
        countText: '890+ styles',
        icon: 'Sliders',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
        banner: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=1000&q=80',
        gender: 'Men',
        subcategories: [
          {
            id: 'bottoms',
            name: 'Selvedge Denim Jeans',
            slug: 'bottoms',
            level: 3,
            countText: '340+ styles',
            icon: 'accessibility',
            image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-trousers',
            name: 'Casual Trousers & Chinos',
            slug: 'men-trousers',
            level: 3,
            countText: '260+ styles',
            icon: 'Sliders',
            image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-trackpants',
            name: 'Track Pants & Joggers',
            slug: 'men-trackpants',
            level: 3,
            countText: '190+ styles',
            icon: 'Layers',
            image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
        ],
      },
      {
        id: 'sub-men-footwear',
        name: "Men's Footwear",
        slug: 'men-footwear',
        level: 2,
        countText: '720+ styles',
        icon: 'Footprints',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
        gender: 'Men',
        subcategories: [
          {
            id: 'footwear',
            name: 'Court Leather Sneakers',
            slug: 'footwear-court',
            level: 3,
            countText: '310+ styles',
            icon: 'snowshoeing',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
          {
            id: 'leaf-men-formalshoes',
            name: 'Derby & Oxford Shoes',
            slug: 'men-formalshoes',
            level: 3,
            countText: '180+ styles',
            icon: 'Briefcase',
            image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80',
            gender: 'Men',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. KIDS' DEPARTMENT
  // =========================================================================
  {
    id: 'cat-kids',
    name: 'Kids',
    slug: 'kids',
    level: 1,
    countText: '1,890+ styles',
    icon: 'Smile',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=1200&q=80',
    gender: 'Kids',
    badge: 'ORGANIC COTTON',
    subcategories: [
      {
        id: 'sub-kids-boys',
        name: 'Boys Clothing',
        slug: 'kids-boys',
        level: 2,
        countText: '780+ styles',
        icon: 'Smile',
        image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
        gender: 'Kids',
        subcategories: [
          {
            id: 'leaf-boys-tshirts',
            name: 'Boys T-Shirts & Polos',
            slug: 'boys-tshirts',
            level: 3,
            countText: '280+ styles',
            icon: 'Shirt',
            image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80',
            gender: 'Kids',
          },
          {
            id: 'leaf-boys-jeans',
            name: 'Boys Jeans & Joggers',
            slug: 'boys-jeans',
            level: 3,
            countText: '190+ styles',
            icon: 'Sliders',
            image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=400&q=80',
            gender: 'Kids',
          },
        ],
      },
      {
        id: 'sub-kids-girls',
        name: 'Girls Clothing',
        slug: 'kids-girls',
        level: 2,
        countText: '820+ styles',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80',
        gender: 'Kids',
        subcategories: [
          {
            id: 'leaf-girls-dresses',
            name: 'Girls Dresses & Frocks',
            slug: 'girls-dresses',
            level: 3,
            countText: '340+ styles',
            icon: 'Heart',
            image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=400&q=80',
            gender: 'Kids',
          },
          {
            id: 'leaf-girls-tops',
            name: 'Girls Tops & Skirts',
            slug: 'girls-tops',
            level: 3,
            countText: '210+ styles',
            icon: 'Sparkles',
            image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca564?auto=format&fit=crop&w=400&q=80',
            gender: 'Kids',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. FOOTWEAR DEPARTMENT
  // =========================================================================
  {
    id: 'cat-footwear',
    name: 'Footwear',
    slug: 'footwear',
    level: 1,
    countText: '2,140+ styles',
    icon: 'Footprints',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
    gender: 'Unisex',
    badge: '18M DROP READY',
    subcategories: [
      {
        id: 'sub-footwear-sneakers',
        name: 'Sneakers & Casuals',
        slug: 'footwear-sneakers',
        level: 2,
        countText: '940+ styles',
        icon: 'Footprints',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
        gender: 'Unisex',
        subcategories: [
          {
            id: 'leaf-sneakers-court',
            name: 'Court Leather Sneakers',
            slug: 'sneakers-court',
            level: 3,
            countText: '380+ styles',
            icon: 'Footprints',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
            gender: 'Unisex',
          },
          {
            id: 'leaf-sneakers-runners',
            name: 'Lightweight Canvas Runners',
            slug: 'sneakers-runners',
            level: 3,
            countText: '290+ styles',
            icon: 'Footprints',
            image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80',
            gender: 'Unisex',
          },
        ],
      },
      {
        id: 'sub-footwear-ethnic',
        name: 'Handcrafted Juttis',
        slug: 'footwear-ethnic',
        level: 2,
        countText: '380+ styles',
        icon: 'Crown',
        image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=600&q=80',
        gender: 'Unisex',
        subcategories: [
          {
            id: 'leaf-juttis-zari',
            name: 'Zari Embroidered Mojaris',
            slug: 'juttis-zari',
            level: 3,
            countText: '180+ styles',
            icon: 'Crown',
            image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=400&q=80',
            gender: 'Unisex',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. BEAUTY & GROOMING
  // =========================================================================
  {
    id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    level: 1,
    countText: '920+ essentials',
    icon: 'Gem',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
    gender: 'Women',
    badge: 'ATELIER BOTANICALS',
    subcategories: [
      {
        id: 'sub-beauty-skincare',
        name: 'Skincare Atelier',
        slug: 'beauty-skincare',
        level: 2,
        countText: '440+ products',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        gender: 'Women',
        subcategories: [
          {
            id: 'beauty',
            name: 'Face Serums & Oils',
            slug: 'beauty-serums',
            level: 3,
            countText: '160+ items',
            icon: 'spa',
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
          {
            id: 'leaf-beauty-cleansers',
            name: 'Gentle Cleansers',
            slug: 'beauty-cleansers',
            level: 3,
            countText: '120+ items',
            icon: 'Droplet',
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
            gender: 'Women',
          },
        ],
      },
    ],
  },
];
