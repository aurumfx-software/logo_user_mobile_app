import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PolicySheet from '../components/PolicySheet';
import { Colors } from '../constants/theme';

/** Full-screen privacy policy from GET /api/v1/content/policies/privacy */
export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <PolicySheet policyKey="privacy" onClose={() => router.back()} />
    </SafeAreaView>
  );
}
