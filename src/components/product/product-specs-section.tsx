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
import { TRUST_PILLARS } from './product-constants';

interface ProductSpecsSectionProps {
  isDarkStoreProduct: boolean;
  specifications?: Record<string, string>;
  fabric?: string | null;
  origin?: string | null;
}

export function ProductSpecsSection({
  isDarkStoreProduct,
  specifications,
  fabric,
  origin,
}: ProductSpecsSectionProps) {
  const [specsOpen, setSpecsOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [tryOnProtocolOpen, setTryOnProtocolOpen] = useState(false);

  const dynamicSpecs = React.useMemo(() => {
    const entries: { label: string; value: string }[] = [];
    if (specifications && Object.keys(specifications).length > 0) {
      for (const [label, value] of Object.entries(specifications)) {
        if (value) entries.push({ label, value: String(value) });
      }
    }
    if (fabric && !entries.some((e) => e.label.toLowerCase().includes('fabric'))) {
      entries.unshift({ label: 'Fabric Composition', value: fabric });
    }
    if (origin && !entries.some((e) => e.label.toLowerCase().includes('origin'))) {
      entries.push({ label: 'Origin', value: origin });
    }
    return entries;
  }, [specifications, fabric, origin]);

  const activeTrustPillars = React.useMemo(() => {
    if (isDarkStoreProduct) return TRUST_PILLARS;
    return [
      TRUST_PILLARS[0],
      {
        icon: RotateCcw,
        title: '7-Day Easy Returns',
        desc: 'Standard doorstep return & exchange',
        color: '#2563EB',
      },
    ];
  }, [isDarkStoreProduct]);

  const careNote = specifications?.Care || specifications?.['Care Instructions'] || specifications?.['Care Protocol'];
  const hasMaterialSpecs = Boolean(fabric || (specifications && Object.keys(specifications).length > 0));
  const hasProvenanceOrCare = Boolean(origin || careNote);
  const showAccordionsHeader = hasMaterialSpecs || isDarkStoreProduct || hasProvenanceOrCare;

  return (
    <>
      {/* Trust Pillars */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {activeTrustPillars.map((pillar, idx) => {
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

      {/* Detailed Product Specifications Matrix */}
      {dynamicSpecs.length > 0 && (
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
            {dynamicSpecs.map((spec, sidx) => (
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
      )}

      {/* Fabric & Specs Accordions */}
      {showAccordionsHeader && (
      <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 10 }}>
        <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#71717A', letterSpacing: 1.4, textTransform: 'uppercase' }}>
          SPECIFICATIONS &amp; CARE
        </Text>

        {/* Accordion 1: Material & Specs (rendered only when material specs exist) */}
        {hasMaterialSpecs && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}>
          <Pressable
            onPress={() => setSpecsOpen(!specsOpen)}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles size={15} color="#FF5A1F" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                Material &amp; Weave Specifications
              </Text>
            </View>
            {specsOpen ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
          </Pressable>

          {specsOpen && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {fabric && (
                  <View style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>COMPOSITION</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>{fabric}</Text>
                  </View>
                )}
                {dynamicSpecs.slice(0, 4).map((spec, idx) => (
                  <View key={idx} style={{ width: '48%', backgroundColor: '#F7F5F0', padding: 8, borderRadius: 10 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#8A8580', textTransform: 'uppercase' }}>{spec.label}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#111111', marginTop: 2 }}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        )}

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
                  1. Rider delivers your primary and backup trial sizes.
                </Text>
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  2. Try at home for 10 minutes at your doorstep.
                </Text>
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  3. Keep what fits and hand back the rest directly to the rider.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Accordion 3: Origin & Care (rendered dynamically only when origin or care specs exist) */}
        {hasProvenanceOrCare && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E8E5DF', overflow: 'hidden' }}>
          <Pressable
            onPress={() => setProvenanceOpen(!provenanceOpen)}
            style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={15} color="#10B981" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#111111' }}>
                Origin &amp; Care Instructions
              </Text>
            </View>
            {provenanceOpen ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
          </Pressable>

          {provenanceOpen && (
            <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4, gap: 8 }}>
              {origin ? (
                <Text style={{ fontSize: 11, color: '#666666', lineHeight: 15 }}>
                  Origin: {origin}
                </Text>
              ) : null}
              {careNote ? (
                <View style={{ alignSelf: 'flex-start', backgroundColor: '#F7F5F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#111111' }}>{careNote}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
        )}
      </View>
      )}
    </>
  );
}
