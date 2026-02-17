import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES, SHADOWS} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {MOCK_ORDERS, PRODUCTS, formatPrice} from '../data/products';
import Icon from '../components/Icon';

interface Props {
  navigation: any;
}

export default function ProfileScreen({navigation}: Props) {
  const {state, dispatch} = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch({type: 'LOGOUT'});
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    Alert.prompt(
      'Edit Name',
      'Enter your new display name:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Save',
          onPress: (newName?: string) => {
            if (newName && newName.trim()) {
              dispatch({
                type: 'LOGIN',
                payload: {
                  email: state.user?.email || '',
                  name: newName.trim(),
                },
              });
            }
          },
        },
      ],
      'plain-text',
      state.user?.name || '',
    );
  };

  const handleOrderPress = (orderId: string, status: string, total: number) => {
    Alert.alert(
      `Order ${orderId}`,
      `Status: ${status}\nTotal: ${formatPrice(total)}\n\nTrack your order in the app for real-time updates.`,
      [
        {text: 'Close', style: 'cancel'},
        {
          text: status === 'In Transit' ? 'Track Order' : 'Reorder',
          onPress: () => {
            if (status !== 'In Transit') {
              navigation.navigate('HomeTab');
            }
          },
        },
      ],
    );
  };

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'My Orders':
        Alert.alert(
          'My Orders',
          `You have ${MOCK_ORDERS.length} orders.\n\n${MOCK_ORDERS.map(o => `${o.id} - ${o.status} - ${formatPrice(o.total)}`).join('\n')}`,
          [{text: 'OK'}],
        );
        break;
      case 'Wishlist': {
        const wishlistProducts = PRODUCTS.filter(p =>
          state.favorites.includes(p.id),
        );
        if (wishlistProducts.length === 0) {
          Alert.alert('Wishlist', 'Your wishlist is empty. Browse products and tap the heart icon to save items.', [{text: 'Browse', onPress: () => navigation.navigate('FavoritesTab')}, {text: 'OK'}]);
        } else {
          navigation.navigate('CategoryProducts', {
            categoryName: 'Wishlist',
            products: wishlistProducts,
          });
        }
        break;
      }
      case 'Saved Addresses':
        Alert.alert(
          'Saved Addresses',
          '123 Fashion Street, Suite 4\nNew York, NY 10001\n\n456 Style Avenue, Apt 2B\nLos Angeles, CA 90001',
          [
            {text: 'OK'},
          ],
        );
        break;
      case 'Payment Methods':
        Alert.alert(
          'Payment Methods',
          'Visa **** 4242\nApple Pay\nCash on Delivery',
          [
            {text: 'OK'},
          ],
        );
        break;
      case 'Notifications':
        Alert.alert(
          'Notifications',
          'All notifications are enabled.\n\nOrder updates, promotions, and new arrivals.',
          [{text: 'OK'}],
        );
        break;
      case 'Settings':
        Alert.alert(
          'Settings',
          'Choose an option:',
          [
            {text: 'Clear Cart', style: 'destructive', onPress: () => dispatch({type: 'CLEAR_CART'})},
            {text: 'Clear Wishlist', style: 'destructive', onPress: () => {
              state.favorites.forEach(id => dispatch({type: 'TOGGLE_FAVORITE', payload: id}));
            }},
            {text: 'Cancel', style: 'cancel'},
          ],
        );
        break;
      case 'Help & Support':
        Alert.alert(
          'Help & Support',
          'Need help? Contact us:\n\nEmail: support@trenzo.app\nPhone: 1-800-TRENZO\n\nFAQ, returns, and shipping info available in-app.',
          [{text: 'OK'}],
        );
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return COLORS.success;
      case 'In Transit':
        return COLORS.warning;
      default:
        return COLORS.midGray;
    }
  };

  if (!state.isLoggedIn) {
    return (
      <View style={styles.notLoggedIn}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.notLoggedInIconContainer}>
          <Icon name="user" size={40} color={COLORS.midGray} />
        </View>
        <Text style={styles.notLoggedInTitle}>Welcome to Trenzo</Text>
        <Text style={styles.notLoggedInSubtitle}>
          Sign in to view your profile,{'\n'}orders, and preferences
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    {icon: 'package', label: 'My Orders', badge: MOCK_ORDERS.length.toString()},
    {icon: 'heart', label: 'Wishlist', badge: state.favorites.length.toString()},
    {icon: 'map-pin', label: 'Saved Addresses'},
    {icon: 'credit-card', label: 'Payment Methods'},
    {icon: 'bell', label: 'Notifications'},
    {icon: 'settings', label: 'Settings'},
    {icon: 'help-circle', label: 'Help & Support'},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.ScrollView
        style={{opacity: fadeAnim}}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{state.user?.name}</Text>
            <Text style={styles.userEmail}>{state.user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Icon name="edit-2" size={16} color={COLORS.charcoal} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleMenuPress('My Orders')}>
            <Text style={styles.statValue}>{MOCK_ORDERS.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleMenuPress('Wishlist')}>
            <Text style={styles.statValue}>{state.favorites.length}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleMenuPress('Saved Addresses')}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Addresses</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => handleMenuPress('My Orders')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {MOCK_ORDERS.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order.id, order.status, order.total)}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: getStatusColor(order.status) + '20'},
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: getStatusColor(order.status)},
                    ]}>
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{order.date}</Text>
              <View style={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.orderItemName} numberOfLines={1}>
                    {item.product.name} x {item.quantity}
                  </Text>
                ))}
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  {formatPrice(order.total)}
                </Text>
                <Icon name="chevron-right" size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.label)}>
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={18} color={COLORS.charcoal} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.badge && item.badge !== '0' && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={18} color={COLORS.midGray} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>Trenzo v1.0.0</Text>

        <View style={{height: 100}} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Not logged in
  notLoggedIn: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notLoggedInTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.midGray,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: SIZES.radiusFull,
    marginTop: 32,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  // Header
  header: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
  },
  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    fontFamily: 'Poppins',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  userEmail: {
    fontSize: SIZES.bodySmall,
    color: COLORS.midGray,
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginTop: 4,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.lightGray,
  },
  // Recent Orders
  section: {
    marginTop: 24,
    paddingHorizontal: SIZES.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.serif,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
  },
  seeAll: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  orderCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.charcoal,
    fontFamily: 'Poppins',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    fontSize: SIZES.tiny,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  orderDate: {
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    marginTop: 4,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  orderItems: {
    marginTop: 10,
  },
  orderItemName: {
    fontSize: SIZES.bodySmall,
    color: COLORS.darkGray,
    marginBottom: 2,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.offWhite,
  },
  orderTotal: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    fontFamily: 'Poppins',
  },
  // Menu
  menuSection: {
    marginTop: 24,
    marginHorizontal: SIZES.screenPadding,
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.offWhite,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: SIZES.bodySmall,
    color: COLORS.charcoal,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'Poppins',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: SIZES.tiny,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: 'Poppins',
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    marginHorizontal: SIZES.screenPadding,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: SIZES.body,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: 'Poppins',
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: SIZES.caption,
    color: COLORS.midGray,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: 'Poppins',
  },
});
