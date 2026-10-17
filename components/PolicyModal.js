import { Modal, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import PolicySheet from './PolicySheet';

export default function PolicyModal({
  visible,
  policyKey = 'privacy',
  onClose,
  onOpenPolicy,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.wrap}>
        {visible ? (
          <PolicySheet
            policyKey={policyKey}
            onClose={onClose}
            onOpenPolicy={onOpenPolicy}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
