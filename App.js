import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, ScrollView, Text, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Grid from './components/Grid';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const App = () => {
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    loadGridData();
  }, []);

  const initializeGridData = () => {
    const rows = 10;
    const columns = 5;
    const initialData = Array(rows).fill('').map(() => Array(columns).fill(''));
    setGridData(initialData);
  };

  const loadGridData = async () => {
    try {
      const data = await AsyncStorage.getItem('gridData');
      if (data) {
        const parsedData = JSON.parse(data);
        const truncatedData = parsedData.map(row => row.slice(0, 5)); // Keep only columns A to E
        setGridData(truncatedData);
      } else {
        const initialData = Array.from({ length: 10 }, () => Array.from({ length: 5 }, () => ''));
        setGridData(initialData);
      }
    } catch (error) {
      console.log('Error loading grid data:', error);
    }
  };
  

  const saveGridData = async () => {
    try {
      await AsyncStorage.setItem('gridData', JSON.stringify(gridData));
      console.log('Grid data saved successfully');
    } catch (error) {
      console.log('Error saving grid data:', error);
    }
  };

  const handleCellChange = (rowIndex, columnIndex, value) => {
    if (columnIndex > 4) {
      return; // Ignore changes in columns beyond E
    }
  
    const updatedGridData = [...gridData];
  
    // Check if a new column is being added
    if (rowIndex === updatedGridData.length - 1 && columnIndex === updatedGridData[0].length - 1 && value !== '') {
      updatedGridData.forEach(row => {
        if (row.length < 5) {
          row.push('');
        }
      });
    }
  
    // Check if a column is being removed
    const isLastColumnEmpty = updatedGridData.every(row => row[row.length - 1] === '');
    if (isLastColumnEmpty && columnIndex === updatedGridData[0].length - 2 && value === '') {
      updatedGridData.forEach(row => {
        row.pop();
      });
    }
  
    updatedGridData[rowIndex][columnIndex] = value;
    setGridData(updatedGridData);
    saveGridData();
  };
  

  const handleDownload = async () => {
    const alphabets = Array.from({ length: gridData[0].length }, (_, index) =>
      String.fromCharCode(65 + index)
    );
  
    const gridDataWithAlphabetsAndNumbers = gridData.map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      return [ rowNumber, ...row];
    });
  
    const gridDataWithAlphabetsNumbersAndHeaders = [['', ...alphabets], ...gridDataWithAlphabetsAndNumbers];
  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(gridDataWithAlphabetsNumbersAndHeaders);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  
    const downloadsPath = FileSystem.documentDirectory + 'sheets.xlsx';
  
    try {
      await FileSystem.writeAsStringAsync(downloadsPath, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Excel file downloaded successfully');
  
      const fileUri = `file://${downloadsPath}`;
      await Sharing.shareAsync(fileUri); // Share the file and prompt user for save location
    } catch (error) {
      console.log('Error downloading Excel file:', error);
    }
  };

  const handleClear = () => {
    const clearedGridData = gridData.map((row, rowIndex) => {
      return row.map((cell, columnIndex) => {
        if (rowIndex === 0 && columnIndex === 0) {
          // Preserve alphabet and number cells
          return cell;
        }
        if (rowIndex === 0) {
          // Clear cells in the first row
          return '';
        }
        if (columnIndex === 0) {
          // Clear cells in the first column
          return null;
        }
        return '';
      });
    });
  
    setGridData(clearedGridData);
    saveGridData();
  };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <Text>Sheets</Text>
        <Button title="Download" onPress={handleDownload} />
        <Button title="Clear" onPress={handleClear} />
      </View>
      <ScrollView>
        <View style={styles.gridContainer}>
          <Grid data={gridData} onCellChange={handleCellChange} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gridContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
});

export default App;