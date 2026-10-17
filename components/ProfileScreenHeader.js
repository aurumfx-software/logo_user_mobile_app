import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

export default function ProfileScreenHeader({ title, rightIcon, onRightPress }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity style={styles.right} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={22} color={Colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.small,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  right: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
});
