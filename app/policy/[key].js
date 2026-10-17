import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import PolicySheet from '../../components/PolicySheet';
import { Colors } from '../../constants/theme';

export default function PolicyScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams();
  const policyKey = String(key || 'privacy');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <PolicySheet policyKey={policyKey} onClose={() => router.back()} />
    </SafeAreaView>
  );
}
