// SearchBar Component - Premium search input
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadow, Spacing, FontSize } from '../constants/theme';

export default function SearchBar({ value, onChangeText, placeholder, onPress, editable = true, onSubmit }) {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.iconWrapper}>
          <Ionicons name="search" size={20} color={Colors.primary} />
        </View>
        <View style={styles.inputPlaceholder}>
          <TextInput
            style={styles.input}
            placeholder={placeholder || 'Search businesses, services...'}
            placeholderTextColor={Colors.textLight}
            editable={false}
            pointerEvents="none"
          />
        </View>
        <View style={styles.filterButton}>
          <Ionicons name="options-outline" size={18} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="search" size={20} color={Colors.primary} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search businesses, services...'}
        placeholderTextColor={Colors.textLight}
        editable={editable}
        autoFocus={editable}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      {value ? (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      ) : (
        <View style={styles.filterButton}>
          <Ionicons name="options-outline" size={18} color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    height: 52,
    ...Shadow.small,
  },
  iconWrapper: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    height: '100%',
  },
  inputPlaceholder: {
    flex: 1,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
