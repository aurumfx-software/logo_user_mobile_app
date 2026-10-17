import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing } from '../constants/theme';

export default function AuthTextField({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = 'none',
  secureTextEntry,
  multiline,
  error,
  maxLength,
  editable = true,
}) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          error && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={hidden}
          autoCorrect={false}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxLength={maxLength}
          editable={editable}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    minHeight: 96,
  },
  inputMultiline: {
    minHeight: 72,
  },
  inputRowError: {
    borderColor: Colors.secondary,
  },
  inputRowDisabled: {
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.secondary,
  },
});
