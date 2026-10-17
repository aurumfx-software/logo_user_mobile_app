import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AuthTextField from '../components/AuthTextField';
import { useAuth } from '../context/AuthContext';
import useUserLocation from '../hooks/useUserLocation';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneOk = (v) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
const pinOk = (v) => /^\d{6}$/.test(v.trim());

function normalizePhone(v) {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`;
  return v.trim();
}

function buildFullAddress({ house, street, landmark, locality, city, district, pincode }) {
  const parts = [
    house.trim(),
    street.trim(),
    landmark?.trim() ? `Near ${landmark.trim()}` : '',
    locality.trim(),
    city.trim(),
    district.trim(),
    `Kerala ${pincode.trim()}`,
  ].filter(Boolean);
  return parts.join(', ');
}

function FormSection({ icon, title, subtitle, children }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { location: gps, status: gpsStatus } = useUserLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const applyCurrentLocation = () => {
    if (gpsStatus !== 'granted' || !gps) {
      Alert.alert(
        'Location unavailable',
        'Allow location access in settings, or enter your address manually.'
      );
      return;
    }
    setLatitude(gps.latitude);
    setLongitude(gps.longitude);
    if (gps.city && !city.trim()) setCity(gps.city);
    if (gps.region && !district.trim()) setDistrict(gps.region);
    if (gps.label && !locality.trim()) setLocality(gps.label);
  };

  const validate = () => {
    const next = {};
    if (!name.trim() || name.trim().length < 2) next.name = 'Enter your full name';
    if (!email.trim()) next.email = 'Email is required';
    else if (!emailOk(email)) next.email = 'Enter a valid email';
    if (!phone.trim()) next.phone = 'Mobile number is required';
    else if (!phoneOk(phone)) next.phone = 'Enter a valid 10-digit Indian mobile';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Use at least 6 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    if (!district.trim()) next.district = 'District is required';
    if (!city.trim()) next.city = 'City / town is required';
    if (!locality.trim()) next.locality = 'Area / locality is required';
    if (!house.trim()) next.house = 'House / flat / building is required';
    if (!street.trim()) next.street = 'Street / road is required';
    if (!pincode.trim()) next.pincode = 'PIN code is required';
    else if (!pinOk(pincode)) next.pincode = 'Enter a valid 6-digit PIN';
    if (!acceptedTerms) next.terms = 'Please accept the terms to continue';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const address = buildFullAddress({
      house,
      street,
      landmark,
      locality,
      city,
      district,
      pincode,
    });

    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email,
        password,
        phone: normalizePhone(phone),
        district: district.trim(),
        city: city.trim(),
        location: locality.trim(),
        address,
        latitude,
        longitude,
      });
      router.replace('/(tabs)/profile');
    } catch (err) {
      Alert.alert('Sign up failed', err?.message || 'Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>Join Logo</Text>
            <Text style={styles.heroSubtitle}>
              Create your account with contact and delivery address details for a personalized Kerala
              experience.
            </Text>
          </LinearGradient>

          <FormSection
            icon="person-outline"
            title="Personal details"
            subtitle="How we can reach you"
          >
            <AuthTextField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="As on your ID"
              autoCapitalize="words"
              error={fieldErrors.name}
            />
            <AuthTextField
              label="Email address"
              hint="Used for login and important updates"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={fieldErrors.email}
            />
            <AuthTextField
              label="Mobile number"
              hint="10-digit Indian mobile with or without +91"
              value={phone}
              onChangeText={setPhone}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              error={fieldErrors.phone}
            />
            <AuthTextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              secureTextEntry
              error={fieldErrors.password}
            />
            <AuthTextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
              error={fieldErrors.confirmPassword}
            />
          </FormSection>

          <FormSection
            icon="home-outline"
            title="Address in Kerala"
            subtitle="Helps us show shops and offers near you"
          >
            <TouchableOpacity style={styles.gpsBtn} onPress={applyCurrentLocation} activeOpacity={0.85}>
              <Ionicons name="locate" size={18} color={Colors.primary} />
              <View style={styles.gpsTextWrap}>
                <Text style={styles.gpsBtnTitle}>Detect location automatically</Text>
                <Text style={styles.gpsBtnSub}>Uses GPS to suggest city & district</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
            {latitude != null && longitude != null && (
              <View style={styles.gpsBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.gpsHint}>Location pinned ({latitude.toFixed(4)}, {longitude.toFixed(4)})</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <AuthTextField
                  label="District"
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Kannur"
                  autoCapitalize="words"
                  error={fieldErrors.district}
                />
              </View>
              <View style={styles.rowItem}>
                <AuthTextField
                  label="City / town"
                  value={city}
                  onChangeText={setCity}
                  placeholder="Payyanur"
                  autoCapitalize="words"
                  error={fieldErrors.city}
                />
              </View>
            </View>

            <AuthTextField
              label="Area / locality"
              value={locality}
              onChangeText={setLocality}
              placeholder="e.g. Payyanur Town, Edappally"
              autoCapitalize="words"
              error={fieldErrors.locality}
            />

            <AuthTextField
              label="House / flat / building"
              value={house}
              onChangeText={setHouse}
              placeholder="e.g. Villa 12, ABC Apartments"
              autoCapitalize="words"
              error={fieldErrors.house}
            />
            <AuthTextField
              label="Street / road"
              value={street}
              onChangeText={setStreet}
              placeholder="e.g. MG Road, NH 66"
              autoCapitalize="words"
              error={fieldErrors.street}
            />
            <AuthTextField
              label="Landmark (optional)"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Near bus stand, opposite temple"
              autoCapitalize="sentences"
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <AuthTextField
                  label="PIN code"
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="670307"
                  keyboardType="number-pad"
                  maxLength={6}
                  error={fieldErrors.pincode}
                />
              </View>
              <View style={styles.rowItem}>
                <AuthTextField label="State" value="Kerala" onChangeText={() => {}} editable={false} />
              </View>
            </View>
          </FormSection>

          <View style={styles.termsRow}>
            <TouchableOpacity
              onPress={() => setAcceptedTerms((v) => !v)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={acceptedTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={acceptedTerms ? Colors.primary : Colors.textLight}
              />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to Logo&apos;s{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/policy/terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/privacy-policy')}>
                Privacy Policy
              </Text>
              , and consent to location data for nearby recommendations.
            </Text>
          </View>
          {fieldErrors.terms ? <Text style={styles.termsError}>{fieldErrors.terms}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/sign-in')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowItem: {
    flex: 1,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryUltraLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  gpsTextWrap: {
    flex: 1,
  },
  gpsBtnTitle: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  gpsBtnSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  gpsHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsError: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
