import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react-native';
import { TRUST_PILLARS, PRODUCT_SPECIFICATIONS } from './product-constants';

interface ProductSpecsSectionProps {
  isDarkStoreProduct: boolean;
}

export function ProductSpecsSection({ isDarkStoreProduct }: ProductSpecsSectionProps) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [tryOnProtocolOpen, setTryOnProtocolOpen] = useState(false);

  return (
    <>
      {/* Luxury Trust Guarantee Pillars (Ajio Luxe / Myntra standard) */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TRUST_PILLARS.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <View
                key={idx}
                style={{
                  width: '48.5%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: '#E8E5DF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#FAF8F5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp size={15} color={pillar.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#111111' }}>
                    {pillar.title}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#71717A' }} numberOfLines={1}>
                    {pillar.desc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Detailed Product Specifications Matrix (Ajio Luxe Standard) */}
      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E8E5DF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Layers size={14} color="#FF5A1F" />
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#111111' }}>
                Product Specifications
              </Text>
            </View>
            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#71717A', textTransform: 'uppercase' }}>
              ATELIER VERIFIED
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {PRODUCT_SPECIFICATIONS.map((spec, sidx) => (
              <View
                key={sidx}
                style={{
                  width: '49%',
                  backgroundColor: '#FAF8F5',
                  borderRadius: 12,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#F0ECE4',
                }}
              >
                <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>
                  {spec.label}
                </Text>
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#111111', marginTop: 2 }}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Fabric & Artisan Accordions */}
      <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 10 }}>
        <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#71717A', letterSpacing: 1.4, textTransform: 'uppercase' }}>
          ATELIER CRAFTSMANSHIP & PROVENANCE
        </Text>

        {/* Accordion 1: Loom & Weave Specs */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}>
          <Pressable
            onPress={() => setSpecsOpen(!specsOpen)}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles size={15} color="#FF5A1F" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                Loom & Weave Specifications
              </Text>
            </View>
            {specsOpen ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
          </Pressable>

          {specsOpen && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>COMPOSITION</Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>100% Handloom Chanderi</Text>
                </View>
                <View style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>DENSITY & WEIGHT</Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>90 GSM Featherweight</Text>
                </View>
                <View style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>EMBROIDERY WEFT</Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>Tested Zari Weave</Text>
                </View>
                <View style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                  <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>DYE TECHNIQUE</Text>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>Natural Haldi Extract</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Accordion 2: Doorstep Fitting Protocol */}
        {isDarkStoreProduct && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}>
            <Pressable
              onPress={() => setTryOnProtocolOpen(!tryOnProtocolOpen)}
              style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={15} color="#FF5A1F" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                  Doorstep Fitting Protocol
                </Text>
              </View>
              {tryOnProtocolOpen ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
            </Pressable>

            {tryOnProtocolOpen && (
              <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4, gap: 6 }}>
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  1. Rider hands over outfit in sanitized ceremonial dust bag with hanger.
                </Text>
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  2. Take your time in your personal mirror for 10 full minutes.
                </Text>
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  3. Love it? Retain it immediately. Dislike fit? Hand back immediately with zero return fees or form filling.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Accordion 3: Weaver Collective & Care */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}>
          <Pressable
            onPress={() => setProvenanceOpen(!provenanceOpen)}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={15} color="#10B981" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                Weaver Collective & Care
              </Text>
            </View>
            {provenanceOpen ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
          </Pressable>

          {provenanceOpen && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}>
              <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15, marginBottom: 8 }}>
                Hand-woven by the Ansari Weaver Cluster in Varanasi over 18 working days. Directly supports 4 traditional artisan households.
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ backgroundColor: '#F7F5F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111' }}>Dry Clean Only</Text>
                </View>
                <View style={{ backgroundColor: '#F7F5F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111' }}>Warm Iron with Muslin</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </>
  );
}
