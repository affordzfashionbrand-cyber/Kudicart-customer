import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ProductCard } from '@/components/common/product-card';
import { EditorialText } from '@/components/common/section-title';

interface ProductEnsembleSectionProps {
  ensembleProducts: any[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: any) => void;
  onOpenProduct: (id: string) => void;
}

export function ProductEnsembleSection({
  ensembleProducts,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onOpenProduct,
}: ProductEnsembleSectionProps) {
  if (!ensembleProducts || ensembleProducts.length === 0) return null;

  return (
    <View style={{ marginTop: 24, paddingLeft: 16 }}>
      <View style={{ paddingRight: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#FF5A1F', letterSpacing: 1.2, textTransform: 'uppercase' }}>
          CURATED STYLING
        </Text>
        <EditorialText
          first="Complete the"
          second="ensemble."
          fontSize={18}
          lineHeight={22}
          color="#111111"
          singleLine
          withDot
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
        {ensembleProducts.map((ep) => (
          <View key={ep.id} style={{ width: 175 }}>
            <ProductCard
              product={ep}
              badge="18M DROP"
              wished={wishlist.includes(String(ep.id))}
              onWishlist={() => onToggleWishlist(String(ep.id))}
              onBag={() => onAddToCart(ep)}
              onOpen={() => onOpenProduct(String(ep.id))}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
