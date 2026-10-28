// Multi-Angle Luxury Editorial Product Galleries for KudiCart / Affordz

export interface GalleryShot {
  uri: string;
  label: string;
  shotType?: 'FRONT' | 'WEAVE' | 'DRAPE' | 'BACK' | 'DETAIL';
}

export const PRODUCT_GALLERIES: Record<string, GalleryShot[]> = {
  // 101 / prod-2: Varanasi Looms Handloom Cotton Saree with Zari (from user's screenshot)
  '101': [
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Lookbook Drape',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Golden Zari & Weave',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Fall & Pleats',
      shotType: 'DRAPE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Pallu & Border Motif',
      shotType: 'BACK',
    },
    {
      uri: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=90',
      label: 'Atelier Runway',
      shotType: 'DETAIL',
    },
  ],
  'prod-2': [
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Lookbook Drape',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Golden Zari & Weave',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Fall & Pleats',
      shotType: 'DRAPE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Pallu & Border Motif',
      shotType: 'BACK',
    },
    {
      uri: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=90',
      label: 'Atelier Runway',
      shotType: 'DETAIL',
    },
  ],

  // 102 / prod-1: Avanya Ethnic Embroidered Mulberry Silk Anarkali Suit
  '102': [
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Silhouette',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Zari Embroidery Close-Up',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Full Anarkali Flare',
      shotType: 'DRAPE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Dupatta Styling',
      shotType: 'BACK',
    },
  ],
  'prod-1': [
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Silhouette',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Zari Embroidery Close-Up',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Full Anarkali Flare',
      shotType: 'DRAPE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Dupatta Styling',
      shotType: 'BACK',
    },
  ],

  // 103 / prod-3: Gulabi Studio Tiered Floral Rayon Maxi Dress
  '103': [
    {
      uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90',
      label: 'Full Maxi Look',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90',
      label: 'Floral Hand-Print',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Tie & Silhouette',
      shotType: 'BACK',
    },
    {
      uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90',
      label: 'Runway Movement',
      shotType: 'DRAPE',
    },
  ],
  'prod-3': [
    {
      uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90',
      label: 'Full Maxi Look',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90',
      label: 'Floral Hand-Print',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Tie & Silhouette',
      shotType: 'BACK',
    },
    {
      uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90',
      label: 'Runway Movement',
      shotType: 'DRAPE',
    },
  ],

  // 104 / prod-4 / 2: Studio 04 Structured Cotton / Linen Casual Shirt
  '104': [
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Studio Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90',
      label: 'Collar & Linen Weave',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=1200&q=90',
      label: 'Cuff & Pocket Craft',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Profile',
      shotType: 'DRAPE',
    },
  ],
  '2': [
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Studio Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90',
      label: 'Collar & Linen Weave',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=1200&q=90',
      label: 'Cuff & Pocket Craft',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Profile',
      shotType: 'DRAPE',
    },
  ],
  'prod-4': [
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Studio Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90',
      label: 'Collar & Linen Weave',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=1200&q=90',
      label: 'Cuff & Pocket Craft',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Profile',
      shotType: 'DRAPE',
    },
  ],

  // 105 / prod-5 / 4: Aurel Wide Leg Tailored Trousers
  '105': [
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Tailored Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Waist Pleat Craft',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Hemline Crease',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90',
      label: 'Atelier Runway Stride',
      shotType: 'DRAPE',
    },
  ],
  '4': [
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Tailored Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Waist Pleat Craft',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Hemline Crease',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90',
      label: 'Atelier Runway Stride',
      shotType: 'DRAPE',
    },
  ],
  'prod-5': [
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Tailored Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Waist Pleat Craft',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Hemline Crease',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90',
      label: 'Atelier Runway Stride',
      shotType: 'DRAPE',
    },
  ],

  // 106 / prod-6 / 9: Maison Chanderi Silk Kurta Set
  '106': [
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Chanderi Drape',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Zari Weave Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Sleeve & Neckline Motif',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Dupatta Styling',
      shotType: 'BACK',
    },
  ],
  '9': [
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Chanderi Drape',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Zari Weave Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Sleeve & Neckline Motif',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Dupatta Styling',
      shotType: 'BACK',
    },
  ],
  'prod-6': [
    {
      uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90',
      label: 'Chanderi Drape',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90',
      label: 'Zari Weave Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90',
      label: 'Sleeve & Neckline Motif',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90',
      label: 'Dupatta Styling',
      shotType: 'BACK',
    },
  ],

  // 107 / prod-7 / 10: Royal Men Raw Silk Kurta Set
  '107': [
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Royal Posture',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Silk Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=90',
      label: 'Mandarin Collar',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=90',
      label: 'Runway Look',
      shotType: 'DRAPE',
    },
  ],
  '10': [
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Royal Posture',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Silk Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=90',
      label: 'Mandarin Collar',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=90',
      label: 'Runway Look',
      shotType: 'DRAPE',
    },
  ],
  'prod-7': [
    {
      uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90',
      label: 'Royal Posture',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Silk Texture',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=90',
      label: 'Mandarin Collar',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=90',
      label: 'Runway Look',
      shotType: 'DRAPE',
    },
  ],

  // 108 / prod-8 / 7: Novalis Raw Selvedge Denim
  '108': [
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Denim Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=1200&q=90',
      label: 'Selvedge ID Line',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=90',
      label: 'Copper Rivets',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Silhouette',
      shotType: 'BACK',
    },
  ],
  '7': [
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Denim Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=1200&q=90',
      label: 'Selvedge ID Line',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=90',
      label: 'Copper Rivets',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Silhouette',
      shotType: 'BACK',
    },
  ],
  'prod-8': [
    {
      uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90',
      label: 'Raw Denim Fit',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=1200&q=90',
      label: 'Selvedge ID Line',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=90',
      label: 'Copper Rivets',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Silhouette',
      shotType: 'BACK',
    },
  ],

  // 1: Aurel Relaxed Wool Coat
  '1': [
    {
      uri: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=90',
      label: 'Wool Silhouette',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90',
      label: 'Lapel & Buttons',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90',
      label: 'Side Profile',
      shotType: 'DRAPE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90',
      label: 'Back Hemline',
      shotType: 'BACK',
    },
  ],

  // 3 / prod-10: Forme Minimal Leather Tote
  '3': [
    {
      uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Leather Angle',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=90',
      label: 'Grain & Stitching',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=90',
      label: 'Hardware & Straps',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Scale',
      shotType: 'DRAPE',
    },
  ],
  'prod-10': [
    {
      uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90',
      label: 'Front Leather Angle',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=90',
      label: 'Grain & Stitching',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=90',
      label: 'Hardware & Straps',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=90',
      label: 'Model Scale',
      shotType: 'DRAPE',
    },
  ],

  // 8 / prod-9: Studio 04 Court Minimal Leather Sneaker
  '8': [
    {
      uri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=90',
      label: 'Side Profile',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90',
      label: 'Leather Sole Craft',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=90',
      label: 'Top-Down View',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=90',
      label: 'Heel Counter',
      shotType: 'BACK',
    },
  ],
  'prod-9': [
    {
      uri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=90',
      label: 'Side Profile',
      shotType: 'FRONT',
    },
    {
      uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90',
      label: 'Leather Sole Craft',
      shotType: 'WEAVE',
    },
    {
      uri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=90',
      label: 'Top-Down View',
      shotType: 'DETAIL',
    },
    {
      uri: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=90',
      label: 'Heel Counter',
      shotType: 'BACK',
    },
  ],
};

// Generic Editorial Angle Fallback Sets by category
const CATEGORY_ANGLE_FALLBACKS: Record<string, GalleryShot[]> = {
  Ethnic: [
    { uri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90', label: 'Lookbook Drape' },
    { uri: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=90', label: 'Zari Weave Detail' },
    { uri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90', label: 'Model Silhouette' },
    { uri: 'https://images.unsplash.com/photo-1610030469668-93510cb67655?auto=format&fit=crop&w=1200&q=90', label: 'Border Styling' },
  ],
  Western: [
    { uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=90', label: 'Front Look' },
    { uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=90', label: 'Fabric Detail' },
    { uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=90', label: 'Back Silhouette' },
    { uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90', label: 'Movement Shot' },
  ],
  Tops: [
    { uri: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90', label: 'Front Studio' },
    { uri: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90', label: 'Collar & Weave' },
    { uri: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=1200&q=90', label: 'Cuff & Pocket' },
    { uri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=90', label: 'Model Walk' },
  ],
  Bottoms: [
    { uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=90', label: 'Front Fit' },
    { uri: 'https://images.unsplash.com/photo-1506629905607-d9e08e2d3e8e?auto=format&fit=crop&w=1200&q=90', label: 'Waist & Pleat' },
    { uri: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=1200&q=90', label: 'Hemline Detail' },
    { uri: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=90', label: 'Back Pockets' },
  ],
  Footwear: [
    { uri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=90', label: 'Side Profile' },
    { uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90', label: 'Sole Craft' },
    { uri: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=90', label: 'Top-Down View' },
    { uri: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=90', label: 'Heel Counter' },
  ],
  Accessories: [
    { uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90', label: 'Front Angle' },
    { uri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=90', label: 'Grain & Stitch' },
    { uri: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=90', label: 'Hardware' },
    { uri: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=90', label: 'Carry Scale' },
  ],
};

/**
 * Resolves full multi-angle gallery with rich shot metadata for any product.
 * Guarantees every product in the atelier has 4-5 high-resolution editorial photos.
 */
export function resolveProductGalleryShots(product: {
  id?: string | number;
  category?: string;
  wear?: string;
  image?: string;
  galleryImages?: string[];
}): GalleryShot[] {
  const pId = String(product.id || '');

  // 1. Check pre-curated dictionary
  if (pId && PRODUCT_GALLERIES[pId]) {
    return PRODUCT_GALLERIES[pId];
  }

  // 2. Check if galleryImages is populated with > 1 URLs
  if (product.galleryImages && product.galleryImages.length > 1) {
    const defaultLabels = ['Lookbook View', 'Craftsmanship Detail', 'Model Drape', 'Back Styling', 'Atelier Finish'];
    return product.galleryImages.map((uri, idx) => ({
      uri,
      label: defaultLabels[idx % defaultLabels.length] || `Angle ${idx + 1}`,
    }));
  }

  // 3. Fallback to category angles, preserving the product's primary image as Shot 1
  const key = product.wear || product.category || 'Western';
  const fallbackSet = CATEGORY_ANGLE_FALLBACKS[key] || CATEGORY_ANGLE_FALLBACKS.Western;

  const mainUri = product.image || (fallbackSet[0] ? fallbackSet[0].uri : '');
  const shots: GalleryShot[] = [
    { uri: mainUri, label: 'Main Lookbook' },
    ...fallbackSet.slice(1),
  ];

  return shots;
}
