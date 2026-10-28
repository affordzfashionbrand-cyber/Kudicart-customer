import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { LazyImage } from '@/components/common/lazy-image';
import { Icon } from '@/components/icon';

interface VisualSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPattern: (categoryOrKeyword: string) => void;
}

export function VisualSearchModal({
  visible,
  onClose,
  onSelectPattern,
}: VisualSearchModalProps) {
  const [isScanning, setIsScanning] = useState(false);

  const samplePatterns = [
    {
      label: 'Golden Zari Embroidery',
      query: 'zari',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBTs6-ZqrlCWEJVbPDPREz0wpb5KSte4RfbM_CFWtYByj1Qc_k44_GCyF1iH4BGfJnWitJDsFkbG5QdTkr1lWbmeRjm4Sjw1-H24gH-93XY9maRVKsweEwf47isp-cXHwTuC01nyYYwhghENAssQln3RbbqPdr5ZU7vbKVIAZzaBN3nCBPzrEWX99MdjRBISiVH6LhmgYy1UufvPL6FavGOUabgo-pl4fxAqy5IIErLKuy3XyzrqnSLzg',
    },
    {
      label: 'Handloom Cotton Silk',
      query: 'handloom',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBZmXmAng2VIvmt-e5UoQ1MrsXUMl1p1ftqAD3jjKM_YhlObUmOfd_rwaYD9cuGHuKnJVJBq6kagdOAfjiCSzvvDeVpdrAoGZBOD7YgEfEhdUx85DVetiWSmEdkgQISuSVzZXuSiadjUZUFFvsv0XIZp7_tRq9rvE-Exol7J2LYupakSoB-rwJjs7Y3evVbNoXHjav-QXpye1FUGXeKzjdjw_34arHkcmA3NY6gd6xMd-6DRSq6M5oNfw',
    },
    {
      label: 'Floral Rayon Tiered',
      query: 'floral',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuChjjRPXtK6wGlAzoX8MBkuhS5YQslHvyJa70gSCTmiApO-Lv00JijbP2efRpHEXOYf7Sb03MXrwmH90rYSHdWR_oiv_PNVMCQPGogU99bT_moi70avCMo2utLRF3l_PH6o7WaUE_ndCaN1oW4g9nWiFuH3yLqZDFknFOazu7KzBYjldvcFKSVuQDqubPby_0bCn0qmp1p5scLFl83Y1KDLoHjsLtaL4FCmrZV4k7E3Zx-u5XYrt3g3KQ',
    },
  ];

  const handleSimulateScan = (query: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onSelectPattern(query);
      onClose();
    }, 700);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 items-center justify-center p-4">
        <View style={{ backgroundColor: '#F7F7F5' }} className="rounded-3xl w-full max-w-md p-5 border border-[#D9D9D5] shadow-xl">
          {/* Header */}
          <View className="flex flex-row items-center justify-between pb-3 border-b border-[#D9D9D5]">
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-[#F4F1EA] border border-[#D9D9D5] flex items-center justify-center">
                <Icon name="photo_camera" size={18} color="#111111" />
              </View>
              <Text className="text-[17px] font-black tracking-tight text-[#111111]">
                VISUAL DROP SEARCH
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-[#F4F1EA] border border-[#D9D9D5] flex items-center justify-center"
            >
              <Icon name="close" size={16} color="#353335" />
            </TouchableOpacity>
          </View>

          {/* Camera Scanner Simulation Frame */}
          <View className="relative w-full aspect-[16/10] bg-[#F4F1EA] rounded-2xl my-3 overflow-hidden items-center justify-center border border-dashed border-[#D9D9D5]">
            {isScanning ? (
              <View className="items-center justify-center">
                <Icon name="sync" size={32} color="#111111" />
                <Text style={{ color: '#111111' }} className="font-extrabold text-[12px] tracking-wider uppercase mt-2">
                  Matching drop silhouettes...
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center p-4">
                <View className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center mb-2 shadow-xs">
                  <Icon name="camera_alt" size={22} color="#ffffff" />
                </View>
                <Text className="text-[13px] font-extrabold text-[#111111] text-center">
                  Point at any fabric, pattern, or silhouette
                </Text>
                <Text className="text-[11px] text-[#6B6667] text-center mt-1">
                  Instantaneous search matching our live fashion drops
                </Text>
              </View>
            )}
          </View>

          {/* Sample Swatches / Quick Looks */}
          <View className="my-1">
            <Text className="text-[10px] uppercase font-extrabold text-[#6B6667] tracking-wider mb-2">
              Or Try Popular Aesthetics
            </Text>
            <View className="flex flex-col gap-2">
              {samplePatterns.map((item) => (
                <TouchableOpacity
                  key={item.query}
                  onPress={() => handleSimulateScan(item.query)}
                  activeOpacity={0.8}
                  style={{ backgroundColor: '#F4F1EA', borderColor: '#D9D9D5' }}
                  className="flex flex-row items-center gap-3 p-2.5 rounded-xl border"
                >
                  <LazyImage
                    source={item.image}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-[12px] font-bold text-[#111111]">
                      {item.label}
                    </Text>
                    <Text style={{ color: '#6B6667' }} className="text-[10px] font-extrabold uppercase">
                      Tap to match in drop catalog
                    </Text>
                  </View>
                  <Icon name="chevron_right" size={18} color="#111111" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
