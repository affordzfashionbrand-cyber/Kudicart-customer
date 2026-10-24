import { Icon } from '@/components/icon';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavBarProps {
    activeTab?: 'home' | 'explore' | 'deals' | 'categories' | 'account';
    onTabChange?: (tab: 'home' | 'explore' | 'deals' | 'categories' | 'account') => void;
    onOpenCategories?: () => void;
    onOpenAccount?: () => void;
    onScrollToDeals?: () => void;
}

export function BottomNavBar({
    activeTab = 'home',
    onTabChange,
    onOpenCategories,
    onOpenAccount,
    onScrollToDeals,
}: BottomNavBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const tabs: {
        id: 'home' | 'explore' | 'deals' | 'categories' | 'account';
        label: string;
        icon: string;
        badge?: string;
    }[] = [
            { id: 'home', label: 'Home', icon: 'storefront' },
            { id: 'explore', label: 'Explore', icon: 'explore' },
            { id: 'deals', label: 'Deals', icon: 'bolt', badge: 'HOT' },
            { id: 'categories', label: 'Categories', icon: 'grid_view' },
            { id: 'account', label: 'Account', icon: 'person' },
        ];

    const effectiveWidth = Math.min(width, 440);
    const tabWidth = effectiveWidth / tabs.length;
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);

    // Animated sliding indicator
    const [indicatorAnim] = useState(
        () => new Animated.Value((activeIndex >= 0 ? activeIndex : 0) * tabWidth + tabWidth / 2)
    );

    useEffect(() => {
        const targetX = (activeIndex >= 0 ? activeIndex : 0) * tabWidth + tabWidth / 2;
        Animated.spring(indicatorAnim, {
            toValue: targetX,
            bounciness: 8,
            speed: 16,
            useNativeDriver: true,
        }).start();
    }, [activeIndex, tabWidth, indicatorAnim]);

    const handleTabPress = (tabId: 'home' | 'explore' | 'deals' | 'categories' | 'account') => {
        if (onTabChange) onTabChange(tabId);

        if (tabId === 'home') {
            if (pathname !== '/') router.push('/');
        } else if (tabId === 'explore') {
            router.push('/explore');
        } else if (tabId === 'deals') {
            if (onScrollToDeals) onScrollToDeals();
        } else if (tabId === 'categories') {
            if (onOpenCategories) onOpenCategories();
            else if (pathname !== '/explore') router.push('/explore');
        } else if (tabId === 'account') {
            if (onOpenAccount) onOpenAccount();
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, 6),
                },
            ]}
        >
            {/* Sliding Top Highlight Bar / Dot Indicator */}
            <Animated.View
                style={[
                    styles.indicatorPill,
                    {
                        transform: [
                            {
                                translateX: Animated.subtract(indicatorAnim, 16),
                            },
                        ],
                    },
                ]}
            />

            <View style={styles.tabRow}>
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => handleTabPress(tab.id)}
                            activeOpacity={0.7}
                            style={styles.tabButton}
                        >
                            <View style={styles.iconWrap}>
                                <Icon
                                    name={tab.icon}
                                    size={22}
                                    color={isActive ? '#111111' : '#6B6667'}
                                />
                                {tab.badge && (
                                    <View style={styles.badgePill}>
                                        <Text style={styles.badgeText}>{tab.badge}</Text>
                                    </View>
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.tabLabel,
                                    isActive && styles.tabLabelActive,
                                ]}
                            >
                                {tab.label}
                            </Text>

                            {/* Sub-dot under active item label */}
                            {isActive && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 440,
        alignSelf: 'center',
        backgroundColor: '#F7F7F5',
        borderTopWidth: 1,
        borderTopColor: '#D9D9D5',
        shadowColor: '#111111',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 90,
    },
    indicatorPill: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 32,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#111111',
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    iconWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgePill: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: '#111111',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 7.5,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    tabLabel: {
        fontSize: 10.5,
        fontWeight: '700',
        color: '#6B6667',
        marginTop: 2,
        letterSpacing: 0.3,
    },
    tabLabelActive: {
        color: '#111111',
        fontWeight: '900',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FF5A1F',
        marginTop: 2,
    },
});
