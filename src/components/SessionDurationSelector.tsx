import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const PRESET_OPTIONS = [25, 45, 60];

const SessionDurationSelector: React.FC<Props> = ({ value, onChange }) => {
  const isCustom = useMemo(() => !PRESET_OPTIONS.includes(value), [value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>セッション予定時間</Text>
      <View style={styles.optionsRow}>
        {PRESET_OPTIONS.map((option) => {
          const isSelected = option === value;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => onChange(option)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}分
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.customInputRow}>
        <Text style={styles.customLabel}>カスタム:</Text>
        <TextInput
          keyboardType="number-pad"
          value={isCustom ? value.toString() : ''}
          placeholder="分を入力"
          placeholderTextColor="#94a3b8"
          onChangeText={(text) => {
            const parsed = Number(text.replace(/[^0-9]/g, ''));
            if (!Number.isNaN(parsed)) {
              onChange(Math.max(parsed, 1));
            }
          }}
          style={styles.input}
        />
        <Text style={styles.customSuffix}>分</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#cbd5f5',
    marginBottom: 12,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    columnGap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#1e293b',
  },
  optionButtonSelected: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  optionText: {
    textAlign: 'center',
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#0f172a',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  customLabel: {
    color: '#94a3b8',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 4,
  },
  customSuffix: {
    color: '#94a3b8',
    marginLeft: 4,
  },
});

export default SessionDurationSelector;
