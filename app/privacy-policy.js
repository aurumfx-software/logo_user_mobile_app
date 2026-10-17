import { useRouter } from 'expo-router';
import { View } from 'react-native';
import PolicySheet from '../components/PolicySheet';
import { Colors } from '../constants/theme';

/** Full-screen privacy policy from GET /api/v1/content/policies/privacy */
export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <PolicySheet
        policyKey="privacy"
        onClose={() => router.back()}
        onOpenPolicy={(nextKey) => router.push(`/policy/${nextKey}`)}
      />
    </View>
  );
}
