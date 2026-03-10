import React, {useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import BlurView from '../components/BlurFallback';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, FONT_WEIGHTS, SIZES} from '../utils/theme';
import {useApp} from '../context/AppContext';
import {useTheme} from '../context/ThemeContext';
import GenderGradientBg from '../components/GenderGradientBg';
import Icon from '../components/Icon';

const {width: SW, height: SH} = Dimensions.get('window');

const SOCIAL_PROVIDERS = [
  {key: 'Google', icon: 'logo-google', family: 'ionicons' as const},
  {key: 'Instagram', icon: 'logo-instagram', family: 'ionicons' as const},
  {key: 'Twitter', icon: 'logo-twitter', family: 'ionicons' as const},
  {key: 'TikTok', icon: 'musical-note', family: 'ionicons' as const},
];

interface Props {
  route: any;
  navigation: any;
}

export default function AuthScreen({route, navigation}: Props) {
  const {dispatch} = useApp();
  const {colors, isDark} = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const returnTo = route.params?.returnTo;

  const C = {
    dark: colors.background,
    darkSurface: colors.background,
    glass: colors.glassLight,
    glassBorder: colors.glassLight,
    white: colors.textPrimary,
    textDark: colors.textPrimary,
    textWhite: colors.textPrimary,
    textMuted: colors.textTertiary,
    textLabel: colors.textTertiary,
    accent: colors.accent,
    accentLight: colors.accent,
    accentText: colors.accentText,
  };

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');

  const showModal = useCallback((title: string, body: string) => {
    setModalTitle(title);
    setModalBody(body);
    setModalVisible(true);
  }, []);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleMode = () => {
    Animated.timing(slideAnim, {
      toValue: isLogin ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsLogin(!isLogin);
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      showModal('Forgot Password', 'Please enter your email address first, then tap Forgot Password.');
      return;
    }
    showModal('Password Reset', `We've sent a password reset link to ${email.trim()}. Please check your inbox.`);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    setTimeout(async () => {
      const emailMap: Record<string, string> = {
        Google: 'user@gmail.com',
        Instagram: 'user@instagram.com',
        Twitter: 'user@twitter.com',
        TikTok: 'user@tiktok.com',
      };
      const socialUser = {
        email: emailMap[provider] || 'user@social.com',
        name: `${provider} User`,
      };
      await AsyncStorage.setItem('@trenzo_user', JSON.stringify(socialUser));
      dispatch({type: 'LOGIN', payload: socialUser});
      setLoading(false);
      if (returnTo) {
        navigation.replace(returnTo);
      } else {
        navigation.goBack();
      }
    }, 1000);
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      showModal('Error', 'Please fill in all fields');
      return;
    }
    if (!isLogin && !name.trim()) {
      showModal('Error', 'Please enter your name');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const user = {
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
      };
      await AsyncStorage.setItem('@trenzo_user', JSON.stringify(user));
      dispatch({type: 'LOGIN', payload: user});
      setLoading(false);
      if (returnTo) {
        navigation.replace(returnTo);
      } else {
        navigation.goBack();
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <GenderGradientBg />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ===== TOP SECTION with curved bottom ===== */}
      <View style={styles.whiteTop}>
        {/* Top bar: icon + trenzo | Sign Up */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <TouchableOpacity
              style={styles.appIcon}
              onPress={() => navigation.goBack()}>
              <Icon name="shopping-bag" size={18} color={C.textDark} />
            </TouchableOpacity>
            <Text style={styles.brandName}>trenzo</Text>
          </View>
          <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
            <Icon name="user" size={14} color={C.textDark} />
            <Text style={styles.toggleBtnText}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Large heading */}
        <Text style={styles.heading}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Text>
      </View>

      {/* ===== DARK SECTION with glass inputs ===== */}
      <KeyboardAvoidingView
        style={styles.darkSection}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.glassInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={C.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.glassInput}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={C.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.glassInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* CTA button */}
            <TouchableOpacity
              style={[
                styles.authBtn,
                loading && styles.authBtnDisabled,
              ]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}>
              <Icon name="log-in" size={18} color={C.accentText} />
              <Text style={styles.authBtnText}>
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {isLogin ? 'or Sign In with' : 'or Sign Up with'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social circles */}
          <View style={styles.socialRow}>
            {SOCIAL_PROVIDERS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={styles.socialCircle}
                onPress={() => handleSocialLogin(p.key)}>
                <Icon
                  name={p.icon}
                  size={20}
                  color={C.textWhite}
                  family={p.family}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom toggle */}
          <View style={styles.bottomToggle}>
            <Text style={styles.bottomText}>
              {isLogin
                ? "Don't have an Account? "
                : 'Already have an Account? '}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.bottomLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Glass Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={authModalStyles.overlay}>
          <View style={authModalStyles.card}>
            <BlurView
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={40}
              style={StyleSheet.absoluteFill}
            />
            <View style={[authModalStyles.inner, {borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}]}>
              <Text style={[authModalStyles.title, {color: isDark ? '#FFF' : '#1A1A1A'}]}>{modalTitle}</Text>
              <Text style={[authModalStyles.body, {color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'}]}>{modalBody}</Text>
              <TouchableOpacity
                style={[authModalStyles.btn, {backgroundColor: C.accent}]}
                onPress={() => setModalVisible(false)}>
                <Text style={[authModalStyles.btnText, {color: C.accentText}]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ===== TOP SECTION =====
  whiteTop: {
    backgroundColor: colors.background,
    paddingHorizontal: SIZES.screenPadding,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    zIndex: 5,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 58 : 42,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.serif,
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toggleBtnText: {
    fontSize: SIZES.body,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.semiBold,
    fontFamily: FONTS.sansMedium,
  },
  heading: {
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.sansBold,
    color: colors.textPrimary,
    marginTop: 28,
  },

  // ===== DARK SECTION =====
  darkSection: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 50,
  },

  // Form
  form: {
    paddingHorizontal: SIZES.screenPadding,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 8,
    marginLeft: 6,
  },
  glassInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassLight,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.glassLight,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: SIZES.body,
    color: colors.textPrimary,
    fontWeight: FONT_WEIGHTS.regular,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    marginTop: 2,
  },
  forgotText: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
  },

  // CTA button
  authBtn: {
    backgroundColor: colors.accent,
    borderRadius: SIZES.radiusFull,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  authBtnDisabled: {
    opacity: 0.6,
  },
  authBtnText: {
    color: colors.accentText,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 22,
    paddingHorizontal: SIZES.screenPadding,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassLight,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: SIZES.caption,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: SIZES.screenPadding,
  },
  socialCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.glassLight,
    borderWidth: 1,
    borderColor: colors.glassLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom toggle
  bottomToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  bottomText: {
    fontSize: SIZES.bodySmall,
    color: colors.textTertiary,
    fontWeight: FONT_WEIGHTS.regular,
  },
  bottomLink: {
    fontSize: SIZES.bodySmall,
    color: colors.accent,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

const authModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  inner: {
    padding: 28,
    borderWidth: 1,
    borderRadius: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Rondira-Medium',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    lineHeight: 22,
    marginBottom: 24,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Helvetica',
  },
});
