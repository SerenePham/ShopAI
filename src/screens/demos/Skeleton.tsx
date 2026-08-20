import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function SkeletonDemo() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.skeletonImage, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.skeletonText, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.skeletonTextSmall, { opacity: fadeAnim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  skeletonImage: { width: '100%', height: 120, backgroundColor: '#E0E0E0', borderRadius: 8 },
  skeletonText: { width: '80%', height: 16, backgroundColor: '#E0E0E0', borderRadius: 4, marginTop: 12 },
  skeletonTextSmall: { width: '50%', height: 16, backgroundColor: '#E0E0E0', borderRadius: 4, marginTop: 8 },
});