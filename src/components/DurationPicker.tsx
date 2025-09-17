import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface DurationPickerProps {
  options: number[];
  selected: number;
  onSelect: (value: number) => void;
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)}分`;
}

const DurationPickerComponent = ({ options, selected, onSelect }: DurationPickerProps) => {
  return (
    <View style={styles.container}>
      {options.map((value, index) => {
        const isSelected = value === selected;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(value)}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
              index < options.length - 1 && styles.optionSpacing,
            ]}
          >
            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
              {formatMinutes(value)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const DurationPicker = memo(DurationPickerComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  option: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#3B6E57',
    backgroundColor: 'transparent',
  },
  optionSpacing: {
    marginRight: 16,
  },
  selectedOption: {
    backgroundColor: '#3B6E57',
    borderColor: '#3B6E57',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#3B6E57',
    fontWeight: '400',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '400',
  },
});
