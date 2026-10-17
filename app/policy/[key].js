import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import PolicySheet from '../../components/PolicySheet';
import { Colors } from '../../constants/theme';

export default function PolicyScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams();
  const policyKey = String(key || 'privacy');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <PolicySheet
        policyKey={policyKey}
        onClose={() => router.back()}
        onOpenPolicy={(nextKey) => router.replace(`/policy/${nextKey}`)}
      />
    </View>
  );
}
