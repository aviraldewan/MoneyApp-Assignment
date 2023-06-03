import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const Grid = ({ data, onCellChange }) => {
  return (
    <View style={styles.grid}>
      <View style={styles.headerRow}>
        <Text style={styles.cell}></Text>
        {data.length > 0 &&
          data[0].map((_, columnIndex) => (
            <Text key={columnIndex} style={styles.cell}>
              {String.fromCharCode(65 + columnIndex)}
            </Text>
          ))}
      </View>
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <Text style={styles.cell}>{rowIndex + 1}</Text>
          {row.map((cellValue, columnIndex) => (
            <TextInput
              key={columnIndex}
              style={styles.cellInput}
              value={cellValue}
              onChangeText={text => onCellChange(rowIndex, columnIndex, text)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    textAlign: 'center',
  },
  cellInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    textAlign: 'center',
  },
});

export default Grid;
