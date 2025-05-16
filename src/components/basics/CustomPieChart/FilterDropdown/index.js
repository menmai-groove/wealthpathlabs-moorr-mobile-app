/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FilterDropdown = ({ options, selected, onChange }) => {
  const [visible, setVisible] = useState(false);

  const toggleItem = label => {
    const updated = selected.includes(label)
      ? selected.filter(l => l !== label)
      : [...selected, label];
    onChange(updated);
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange(options.map(o => o.label)); // Select all
    }
  };

  return (
    <View>
      {/* Dropdown toggle */}
      <TouchableOpacity style={styles.dropdownToggle} onPress={() => setVisible(true)}>
        <View style={styles.dropdownToggleRow}>
          <Text style={styles.dropdownText}>
            Filter ({selected.length}/{options.length})
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </View>
      </TouchableOpacity>

      {/* Modal dropdown */}
      <Modal transparent animationType="fade" visible={visible}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setVisible(false)}
          activeOpacity={1}>
          <View style={styles.dropdownPanel}>
            <Text style={styles.header}>Filter Items</Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.option}>
                {selected.length === options.length ? '☑' : '☐'} Select All
              </Text>
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 300 }}>
              {options.map(item => (
                <TouchableOpacity key={item.label} onPress={() => toggleItem(item.label)}>
                  <Text style={styles.option}>
                    {selected.includes(item.label) ? '☑' : '☐'} {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownToggle: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    margin: 10,
  },
  dropdownText: {
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownPanel: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  option: {
    paddingVertical: 8,
    fontSize: 16,
  },
  dropdownToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownArrow: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default FilterDropdown;
