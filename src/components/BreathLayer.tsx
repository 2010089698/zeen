import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface BreathLayerProps {
  position: 'bottom-left' | 'top-right';
}

export const BreathLayer = ({ position }: BreathLayerProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.05)).current;

  useEffect(() => {
    const createBreathAnimation = () => {
      const scaleSequence = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]);

      const opacitySequence = Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.12,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.05,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]);

      return Animated.parallel([
        Animated.loop(scaleSequence),
        Animated.loop(opacitySequence),
      ]);
    };

    const animation = createBreathAnimation();
    animation.start();

    return () => {
      animation.stop();
    };
  }, [scaleAnim, opacityAnim]);

  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-left':
        return styles.bottomLeft;
      case 'top-right':
        return styles.topRight;
      default:
        return styles.bottomLeft;
    }
  };

  return (
    <View style={[styles.container, getPositionStyle()]} pointerEvents="none">
      <Animated.View
        style={[
          styles.breathCircle,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  bottomLeft: {
    bottom: -100,
    left: -100,
  },
  topRight: {
    top: -100,
    right: -100,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6E8B77',
  },
});
