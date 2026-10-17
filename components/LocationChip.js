import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../constants/theme';
import { useAppLocation } from '../context/AppLocationContext';

export default function LocationChip({ style, compact }) {
  const { displayLabel, openPicker } = useAppLocation();

  return (
    <TouchableOpacity
      style={[styles.chip, compact && styles.chipCompact, style]}
      onPress={openPicker}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Location: ${displayLabel}. Tap to change`}
    >
      <Ionicons name="location" size={compact ? 16 : 18} color={Colors.primary} />
      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {displayLabel}
      </Text>
      <Ionicons name="chevron-down" size={compact ? 14 : 16} color={Colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  chipCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  labelCompact: {
    fontSize: FontSize.xs,
  },
});
