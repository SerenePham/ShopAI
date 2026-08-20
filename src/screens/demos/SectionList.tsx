import React from 'react';
import { SectionList, Text, View, StyleSheet } from 'react-native';

const SECTIONS = [
  {
    title: 'Điện thoại',
    data: [
      { id: '1', name: 'iPhone 15' },
      { id: '2', name: 'Galaxy S24' },
    ],
  },
  {
    title: 'Phụ kiện',
    data: [
      { id: '3', name: 'Ốp lưng' },
      { id: '4', name: 'Sạc nhanh' },
    ],
  },
];

export default function SectionListDemo() {
  return (
    <SectionList
      sections={SECTIONS}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.name}</Text>
        </View>
      )}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: { backgroundColor: '#EEE', padding: 8 },
  sectionTitle: { fontWeight: '700', color: '#2C3E50' },
  item: {
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});