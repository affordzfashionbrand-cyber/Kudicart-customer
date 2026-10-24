export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'kurtis' | 'sarees' | 'dresses' | 'fabrics';
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  badge?: string;
  stockBadge?: string;
  subtitle: string;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  deliveryMinutes: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Embroidered Anarkali Kurta Set',
    brand: 'Avanya Ethnic',
    category: 'kurtis',
    rating: 4.8,
    reviewsCount: 142,
    price: 1299,
    originalPrice: 2499,
    discountPercentage: 48,
    badge: '48% OFF',
    stockBadge: 'Only 2 Left',
    subtitle: 'Pure Mulmul Silk with Chiffon Dupatta',
    description:
      'Opulent deep berry-red Anarkali kurta set with intricate golden zari embroidery along the neckline and cuffs. Features breathable cotton-silk lining with a flowing flared silhouette.',
    fabricDetails: 'Pure Mulmul Silk Kurta with Light Chiffon Dupatta & Cotton Lining',
    careInstructions: 'Dry Clean Only. Steam iron on low heat setting.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Signal Orange', hex: '#FF5A1F' },
      { name: 'Ink Black', hex: '#111111' },
      { name: 'Concrete Grey', hex: '#D9D9D5' },
    ],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTs6-ZqrlCWEJVbPDPREz0wpb5KSte4RfbM_CFWtYByj1Qc_k44_GCyF1iH4BGfJnWitJDsFkbG5QdTkr1lWbmeRjm4Sjw1-H24gH-93XY9maRVKsweEwf47isp-cXHwTuC01nyYYwhghENAssQln3RbbqPdr5ZU7vbKVIAZzaBN3nCBPzrEWX99MdjRBISiVH6LhmgYy1UufvPL6FavGOUabgo-pl4fxAqy5IIErLKuy3XyzrqnSLzg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAekMLrVoAyuYOSjh6IMQJ56pPgkCCqfaNkRa5xe9VuQlTnZUt6jzaQDpDqqX1yFZyYDwrw2ODjQWG3KXwGcELLJ-qRfI0JD9j9cemk0YZBqX7R4iqkkIdVxfQloDlDpXJveigrZrnnigDaNJ1Lt9GBA7O7yX-UcXf85ipPHbChLwkEn8IgoXeN9Cavn29fLUUPoJBVS4zRlYEZDXOGbOh9nq30VJKMu0rgQCHXVPl-7TZXLcKQzfcyIw',
    ],
    deliveryMinutes: 35,
  },
  {
    id: 'p2',
    title: 'Handloom Cotton Saree with Zari',
    brand: 'Varanasi Looms',
    category: 'sarees',
    rating: 4.9,
    reviewsCount: 98,
    price: 1849,
    originalPrice: 3190,
    discountPercentage: 42,
    badge: '42% OFF',
    stockBadge: 'Ready to Ship',
    subtitle: 'Includes unstitched blouse piece',
    description:
      'Graceful handloom cotton saree in soft ivory and rose-berry hues with broad golden zari woven border. Hand-woven by master artisans from Varanasi.',
    fabricDetails: '100% Handloom Organza Cotton with Gold Zari Border',
    careInstructions: 'Gentle hand wash in cold water with mild detergent.',
    sizes: ['Free Size (5.5m + 0.8m Blouse)'],
    colors: [
      { name: 'Ivory Rose', hex: '#fbcfe8' },
      { name: 'Sand Cream', hex: '#fef3c7' },
    ],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmXmAng2VIvmt-e5UoQ1MrsXUMl1p1ftqAD3jjKM_YhlObUmOfd_rwaYD9cuGHuKnJVJBq6kagdOAfjiCSzvvDeVpdrAoGZBOD7YgEfEhdUx85DVetiWSmEdkgQISuSVzZXuSiadjUZUFFvsv0XIZp7_tRq9rvE-Exol7J2LYupakSoB-rwJjs7Y3evVbNoXHjav-QXpye1FUGXeKzjdjw_34arHkcmA3NY6gd6xMd-6DRSq6M5oNfw',
    ],
    deliveryMinutes: 35,
  },
  {
    id: 'p3',
    title: 'Tiered Floral Rayon Maxi Dress',
    brand: 'Gulabi Studio',
    category: 'dresses',
    rating: 4.7,
    reviewsCount: 215,
    price: 999,
    originalPrice: 1999,
    discountPercentage: 50,
    badge: '50% OFF',
    subtitle: 'Breathable weave with waist tie-up',
    description:
      'Flowing tiered maxi dress with delicate hand-printed floral motifs in blush pink, rose berry, and peach tones. Adjustable waist tassel tie-up for a flattering fit.',
    fabricDetails: '100% Premium Liva Rayon — Ultra soft and breathable',
    careInstructions: 'Machine wash cold with similar colors. Line dry in shade.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Blush Floral', hex: '#f472b6' },
      { name: 'Peach Coral', hex: '#fb923c' },
    ],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChjjRPXtK6wGlAzoX8MBkuhS5YQslHvyJa70gSCTmiApO-Lv00JijbP2efRpHEXOYf7Sb03MXrwmH90rYSHdWR_oiv_PNVMCQPGogU99bT_moi70avCMo2utLRF3l_PH6o7WaUE_ndCaN1oW4g9nWiFuH3yLqZDFknFOazu7KzBYjldvcFKSVuQDqubPby_0bCn0qmp1p5scLFl83Y1KDLoHjsLtaL4FCmrZV4k7E3Zx-u5XYrt3g3KQ',
    ],
    deliveryMinutes: 35,
  },
  {
    id: 'p4',
    title: 'Chanderi Silk Festive Tunic',
    brand: 'Rawastram',
    category: 'fabrics',
    rating: 4.6,
    reviewsCount: 76,
    price: 1599,
    originalPrice: 2899,
    discountPercentage: 45,
    badge: '45% OFF',
    subtitle: 'Semi-formal silk blend with pockets',
    description:
      'Contemporary Chanderi silk tunic in deep crimson rose with understated silver gotta patti details on the split hem. Functional hidden side pockets.',
    fabricDetails: 'Chanderi Silk Blend with Cotton Mul Lining',
    careInstructions: 'Dry clean recommended to preserve silver gotta embroidery.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Crimson Rose', hex: '#be123c' }],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDxj9qJ4rjOXEvz3V6zfl19DxQXEbbEWw_QYLO5CIyooXurrCEoz26n4Ap5-gXK2jOHfrqWTMVBprdXjwQhbIOn2RxUXpCI07pnEoVqzLSstv9c8rSmZQbB8oD1rzO-PeymawCnUIlxzVgXZZR2KmroE6OLT2MAKSAocBZyiOj37d4-WoHcSqU3SEVit5U_EZG0Y5TYqeRHYQ960WCk6-gJGgxel3HpjeP4FxQJBqDjC3NB2w76D_ymw',
    ],
    deliveryMinutes: 35,
  },
];
