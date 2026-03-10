import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import BlurView from '../components/BlurFallback';
import {SIZES} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import {useGenderPalette} from '../context/GenderPaletteContext';
import {MOCK_ORDERS, PRODUCTS, formatPrice} from '../data/products';
import GenderGradientBg from '../components/GenderGradientBg';
import Icon from '../components/Icon';

const PAD = SIZES.screenPadding;

interface Props {
  navigation: any;
}

export default function ProfileScreen({navigation}: Props) {
  const {state, dispatch} = useApp();
  const {isDark, toggleTheme, statusBarStyle} = useTheme();
  const {palette: gp, activeGender} = useGenderPalette();
  const accent = isDark ? (activeGender === 'Men' ? '#CDF564' : gp.mid) : gp.mid;
  const accentText = isDark ? '#000' : '#FFF';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modal state
  type ModalBtn = {label: string; onPress?: () => void; destructive?: boolean};
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalButtons, setModalButtons] = useState<ModalBtn[]>([]);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteStep, setDeleteStep] = useState<'reason' | 'confirm'>('reason');

  const showModal = useCallback((title: string, body: string, buttons: ModalBtn[]) => {
    setModalTitle(title);
    setModalBody(body);
    setModalButtons(buttons);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => setModalVisible(false), []);

  useEffect(() => {
    Animated.spring(fadeAnim, {toValue: 1, friction: 10, tension: 50, useNativeDriver: true}).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    showModal('Logout', 'Are you sure you want to logout?', [
      {label: 'Cancel'},
      {label: 'Logout', destructive: true, onPress: () => dispatch({type: 'LOGOUT'})},
    ]);
  };

  const handleDeleteAccount = () => {
    setDeleteReason('');
    setDeleteStep('reason');
    setDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    setDeleteVisible(false);
    setDeleteReason('');
    dispatch({type: 'LOGOUT'});
  };

  const handleEditProfile = () => {
    setEditNameValue(state.user?.name || '');
    setEditNameVisible(true);
  };

  const handleSaveEditName = () => {
    if (editNameValue.trim()) {
      dispatch({type: 'LOGIN', payload: {email: state.user?.email || '', name: editNameValue.trim()}});
    }
    setEditNameVisible(false);
  };

  const handleOrderPress = (orderId: string, status: string, total: number) => {
    showModal(
      `Order ${orderId}`,
      `Status: ${status}\nTotal: ${formatPrice(total)}\n\nTrack your order in the app for real-time updates.`,
      [
        {label: 'Close'},
        {label: status === 'In Transit' ? 'Track Order' : 'Reorder', onPress: () => { if (status !== 'In Transit') navigation.navigate('HomeTab'); }},
      ],
    );
  };

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'My Orders':
        showModal('My Orders', `You have ${MOCK_ORDERS.length} orders.\n\n${MOCK_ORDERS.map(o => `${o.id} - ${o.status} - ${formatPrice(o.total)}`).join('\n')}`, [{label: 'OK'}]);
        break;
      case 'Wishlist': {
        const wishlistProducts = PRODUCTS.filter(p => state.favorites.includes(p.id));
        if (wishlistProducts.length === 0) {
          showModal('Wishlist', 'Your wishlist is empty.', [
            {label: 'Browse', onPress: () => navigation.navigate('FavoritesTab')},
            {label: 'OK'},
          ]);
        } else {
          navigation.navigate('CategoryProducts', {categoryName: 'Wishlist', products: wishlistProducts});
        }
        break;
      }
      case 'Saved Addresses':
        showModal('Saved Addresses', '123 Fashion Street, Suite 4\nNew York, NY 10001\n\n456 Style Avenue, Apt 2B\nLos Angeles, CA 90001', [{label: 'OK'}]);
        break;
      case 'Payment Methods':
        showModal('Payment Methods', 'Visa **** 4242\nApple Pay\nCash on Delivery', [{label: 'OK'}]);
        break;
      case 'Notifications':
        showModal('Notifications', 'All notifications are enabled.\n\nOrder updates, promotions, and new arrivals.', [{label: 'OK'}]);
        break;
      case 'Settings':
        showModal('Settings', 'Choose an option:', [
          {label: 'Clear Cart', destructive: true, onPress: () => dispatch({type: 'CLEAR_CART'})},
          {label: 'Clear Wishlist', destructive: true, onPress: () => { state.favorites.forEach(id => dispatch({type: 'TOGGLE_FAVORITE', payload: id})); }},
          {label: 'Cancel'},
        ]);
        break;
      case 'Help & Support':
        showModal('Help & Support', 'Need help? Contact us:\n\nEmail: support@trenzo.app\nPhone: 1-800-TRENZO', [{label: 'OK'}]);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#34C759';
      case 'In Transit': return '#FFD60A';
      default: return isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    }
  };

  if (!state.isLoggedIn) {
    return (
      <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40}}>
        <GenderGradientBg />
        <StatusBar barStyle={statusBarStyle} />
        <View style={[s.emptyIcon, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}]}>
          <Icon name="user" size={40} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'} />
        </View>
        <Text style={[s.emptyTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Welcome to Trenzo</Text>
        <Text style={[s.emptyText, {color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}]}>
          Sign in to view your profile,{'\n'}orders, and preferences
        </Text>
        <TouchableOpacity
          style={[s.signInBtn, {backgroundColor: accent}]}
          onPress={() => navigation.navigate('Auth')}>
          <Text style={{fontSize: 14, fontWeight: '700', fontFamily: 'Helvetica', color: accentText}}>Sign In</Text>
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
    <View style={{flex: 1, backgroundColor: isDark ? '#000' : '#FAFAFA'}}>
      <GenderGradientBg />
      <StatusBar barStyle={statusBarStyle} />
      <Animated.ScrollView
        style={{opacity: fadeAnim, transform: [{translateY: fadeAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}]}}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Profile</Text>
        </View>

        {/* User card */}
        <View style={[s.userCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          <View style={[s.avatar, {backgroundColor: accent}]}>
            <Text style={[s.avatarText, {color: accentText}]}>
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{flex: 1, marginLeft: 16}}>
            <Text style={[s.userName, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{state.user?.name}</Text>
            <Text style={[s.userEmail, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>{state.user?.email}</Text>
          </View>
          <TouchableOpacity style={[s.editBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]} onPress={handleEditProfile}>
            <Icon name="edit-2" size={16} color={isDark ? '#FFF' : '#1A1A1A'} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[s.statsRow, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          <TouchableOpacity style={s.statItem} onPress={() => handleMenuPress('My Orders')}>
            <Text style={[s.statValue, {color: accent}]}>{MOCK_ORDERS.length}</Text>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Orders</Text>
          </TouchableOpacity>
          <View style={[s.statDivider, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}]} />
          <TouchableOpacity style={s.statItem} onPress={() => handleMenuPress('Wishlist')}>
            <Text style={[s.statValue, {color: accent}]}>{state.favorites.length}</Text>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Wishlist</Text>
          </TouchableOpacity>
          <View style={[s.statDivider, {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}]} />
          <TouchableOpacity style={s.statItem} onPress={() => handleMenuPress('Saved Addresses')}>
            <Text style={[s.statValue, {color: accent}]}>2</Text>
            <Text style={[s.statLabel, {color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}]}>Addresses</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Recent Orders</Text>
            <TouchableOpacity onPress={() => handleMenuPress('My Orders')}>
              <Text style={[s.seeAll, {color: accent}]}>See All</Text>
            </TouchableOpacity>
          </View>
          {MOCK_ORDERS.map(order => (
            <TouchableOpacity
              key={order.id}
              style={[s.orderCard, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}
              onPress={() => handleOrderPress(order.id, order.status, order.total)}>
              <View style={s.orderHeader}>
                <Text style={[s.orderId, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{order.id}</Text>
                <View style={[s.statusBadge, {backgroundColor: getStatusColor(order.status) + '20'}]}>
                  <Text style={[s.statusText, {color: getStatusColor(order.status)}]}>{order.status}</Text>
                </View>
              </View>
              <Text style={[s.orderDate, {color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'}]}>{order.date}</Text>
              <View style={{marginTop: 10}}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={[s.orderItemName, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}]} numberOfLines={1}>
                    {item.product.name} x {item.quantity}
                  </Text>
                ))}
              </View>
              <View style={[s.orderFooter, {borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}]}>
                <Text style={[s.orderTotal, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{formatPrice(order.total)}</Text>
                <Icon name="chevron-right" size={16} color={accent} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu */}
        <View style={[s.menuSection, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}]}>
          {/* Dark mode toggle */}
          <TouchableOpacity style={[s.menuItem, {borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}]} onPress={toggleTheme} activeOpacity={0.7}>
            <View style={s.menuLeft}>
              <View style={[s.menuIconWrap, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]}>
                <Icon name={isDark ? 'moon' : 'sun'} size={16} color={isDark ? '#FFF' : '#1A1A1A'} />
              </View>
              <Text style={[s.menuLabel, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <View style={[s.toggle, isDark && {backgroundColor: accent}]}>
              <View style={[s.toggleThumb, isDark && {alignSelf: 'flex-end', backgroundColor: accentText}]} />
            </View>
          </TouchableOpacity>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[s.menuItem, {borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}]}
              onPress={() => handleMenuPress(item.label)}>
              <View style={[s.menuIconWrap, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}]}>
                <Icon name={item.icon} size={16} color={isDark ? '#FFF' : '#1A1A1A'} />
              </View>
              <Text style={[s.menuLabel, {color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}]}>{item.label}</Text>
              <View style={s.menuRight}>
                {item.badge && item.badge !== '0' && (
                  <View style={[s.menuBadge, {backgroundColor: accent + '20'}]}>
                    <Text style={{fontSize: 10, fontWeight: '700', fontFamily: 'Helvetica', color: accent}}>{item.badge}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={16} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out" size={16} color="#FF453A" />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteAccount}>
          <Icon name="trash-2" size={14} color={isDark ? 'rgba(255,69,58,0.6)' : 'rgba(255,69,58,0.7)'} />
          <Text style={[s.deleteText, {color: isDark ? 'rgba(255,69,58,0.6)' : 'rgba(255,69,58,0.7)'}]}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={[s.version, {color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}]}>Trenzo v1.0.0</Text>

        <View style={{height: 100}} />
      </Animated.ScrollView>

      {/* Generic Glass Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {overflow: 'hidden'}]}>
            <BlurView
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={40}
              style={StyleSheet.absoluteFill}
            />
            <View style={[s.modalInner, {borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}]}>
              <Text style={[s.modalTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{modalTitle}</Text>
              <Text style={[s.modalBody, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'}]}>{modalBody}</Text>
              <View style={s.modalBtnRow}>
                {modalButtons.map((btn, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.modalBtn,
                      btn.destructive
                        ? {backgroundColor: 'rgba(255,69,58,0.15)'}
                        : btn.onPress
                        ? {backgroundColor: accent}
                        : {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'},
                    ]}
                    onPress={() => {
                      closeModal();
                      btn.onPress?.();
                    }}>
                    <Text
                      style={[
                        s.modalBtnText,
                        btn.destructive
                          ? {color: '#FF453A'}
                          : btn.onPress
                          ? {color: accentText}
                          : {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'},
                      ]}>
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteVisible} transparent animationType="fade" onRequestClose={() => setDeleteVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {overflow: 'hidden'}]}>
            <BlurView
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={40}
              style={StyleSheet.absoluteFill}
            />
            <View style={[s.modalInner, {borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}]}>
              {deleteStep === 'reason' ? (
                <>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10}}>
                    <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,69,58,0.12)', justifyContent: 'center', alignItems: 'center'}}>
                      <Icon name="alert-triangle" size={18} color="#FF453A" />
                    </View>
                    <Text style={[s.modalTitle, {color: isDark ? '#FFF' : '#1A1A1A', marginBottom: 0}]}>Delete Account</Text>
                  </View>
                  <Text style={[s.modalBody, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', marginBottom: 16}]}>
                    We're sorry to see you go. Please let us know why you'd like to delete your account.
                  </Text>
                  {['No longer using the app', 'Privacy concerns', 'Found a better alternative', 'Too many notifications', 'Other'].map(reason => (
                    <TouchableOpacity
                      key={reason}
                      style={{
                        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
                        borderRadius: 12, marginBottom: 8,
                        backgroundColor: deleteReason === reason
                          ? (isDark ? 'rgba(255,69,58,0.15)' : 'rgba(255,69,58,0.08)')
                          : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'),
                        borderWidth: 1,
                        borderColor: deleteReason === reason ? 'rgba(255,69,58,0.3)' : 'transparent',
                      }}
                      onPress={() => setDeleteReason(reason)}
                      activeOpacity={0.7}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10, borderWidth: 2, marginRight: 12,
                        borderColor: deleteReason === reason ? '#FF453A' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        {deleteReason === reason && <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF453A'}} />}
                      </View>
                      <Text style={{fontSize: 13, fontWeight: '600', fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                  <View style={[s.modalBtnRow, {marginTop: 16}]}>
                    <TouchableOpacity
                      style={[s.modalBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]}
                      onPress={() => setDeleteVisible(false)}>
                      <Text style={[s.modalBtnText, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modalBtn, {backgroundColor: deleteReason ? 'rgba(255,69,58,0.15)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')}]}
                      onPress={() => { if (deleteReason) setDeleteStep('confirm'); }}
                      activeOpacity={deleteReason ? 0.7 : 1}>
                      <Text style={[s.modalBtnText, {color: deleteReason ? '#FF453A' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')}]}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,69,58,0.12)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16}}>
                    <Icon name="trash-2" size={22} color="#FF453A" />
                  </View>
                  <Text style={[s.modalTitle, {color: isDark ? '#FFF' : '#1A1A1A', textAlign: 'center'}]}>Are you sure?</Text>
                  <Text style={[s.modalBody, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)', textAlign: 'center'}]}>
                    This action is permanent and cannot be undone. All your data, orders, and preferences will be permanently deleted.
                  </Text>
                  <View style={{backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 10, padding: 12, marginBottom: 20}}>
                    <Text style={{fontSize: 11, fontWeight: '600', fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', marginBottom: 4}}>Reason:</Text>
                    <Text style={{fontSize: 13, fontFamily: 'Helvetica', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'}}>{deleteReason}</Text>
                  </View>
                  <View style={s.modalBtnRow}>
                    <TouchableOpacity
                      style={[s.modalBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]}
                      onPress={() => setDeleteStep('reason')}>
                      <Text style={[s.modalBtnText, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}]}>Go Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modalBtn, {backgroundColor: '#FF453A'}]}
                      onPress={handleConfirmDelete}>
                      <Text style={[s.modalBtnText, {color: '#FFF'}]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Glass Modal */}
      <Modal visible={editNameVisible} transparent animationType="fade" onRequestClose={() => setEditNameVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, {overflow: 'hidden'}]}>
            <BlurView
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={40}
              style={StyleSheet.absoluteFill}
            />
            <View style={[s.modalInner, {borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}]}>
              <Text style={[s.modalTitle, {color: isDark ? '#FFF' : '#1A1A1A'}]}>Edit Name</Text>
              <Text style={[s.modalBody, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'}]}>Enter your new display name</Text>
              <TextInput
                style={[
                  s.modalInput,
                  {
                    color: isDark ? '#FFF' : '#1A1A1A',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  },
                ]}
                value={editNameValue}
                onChangeText={setEditNameValue}
                placeholder="Your name"
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                autoFocus
                selectionColor={accent}
              />
              <View style={s.modalBtnRow}>
                <TouchableOpacity
                  style={[s.modalBtn, {backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}]}
                  onPress={() => setEditNameVisible(false)}>
                  <Text style={[s.modalBtnText, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.modalBtn, {backgroundColor: accent}]}
                  onPress={handleSaveEditName}>
                  <Text style={[s.modalBtnText, {color: accentText}]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: PAD,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Rondira-Medium',
  },
  // Empty / Not logged in
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    lineHeight: 22,
  },
  signInBtn: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 100,
    marginTop: 28,
  },
  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginTop: 16,
    borderRadius: 18,
    padding: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginTop: 12,
    borderRadius: 18,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: PAD,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  // Orders
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  orderDate: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
  orderItemName: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Helvetica',
  },
  // Menu
  menuSection: {
    marginTop: 24,
    marginHorizontal: PAD,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginRight: 8,
  },
  // Toggle
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(150,150,150,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    marginHorizontal: PAD,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#FF453A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF453A',
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: PAD,
    marginTop: 16,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  // Glass Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
  },
  modalInner: {
    padding: 28,
    borderWidth: 1,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
  modalInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Helvetica',
    borderWidth: 1,
    marginBottom: 20,
  },
});
