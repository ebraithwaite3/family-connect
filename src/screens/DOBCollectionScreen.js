// src/screens/DOBCollectionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { DateTime } from 'luxon';
import { UserService } from '../services/UserService';

const DOBCollectionScreen = ({ user, onComplete }) => {
  const [date, setDate] = useState(new Date(2000, 0, 1)); // Default to Jan 1, 2000
  const [loading, setLoading] = useState(false);

  const handleSaveDOB = async () => {
    try {
      setLoading(true);
      
      // Use Luxon for age validation
      const selectedDate = DateTime.fromJSDate(date);
      const today = DateTime.now();
      const age = today.diff(selectedDate, 'years').years;
      
      if (age < 13) {
        Alert.alert(
          'Age Requirement',
          'You must be at least 13 years old to use this app.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Save DOB as ISO date string (YYYY-MM-DD)
      const dateOfBirth = selectedDate.toISODate(); // Returns YYYY-MM-DD format
      const updatedUser = await UserService.updateDateOfBirth(user.userId, dateOfBirth);
      
      console.log('DOB saved successfully:', dateOfBirth);
      onComplete(updatedUser);
      
    } catch (error) {
      console.error('Error saving DOB:', error);
      Alert.alert(
        'Error',
        'Failed to save your date of birth. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to FamilyConnect!</Text>
        <Text style={styles.subtitle}>
          Hi {user.fullName}, we need your date of birth to complete your profile.
        </Text>
        
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Select your date of birth:</Text>
          
          <DatePicker
            date={date}
            onDateChange={setDate}
            mode="date"
            maximumDate={new Date()} // Can't select future dates
            minimumDate={new Date(1950, 0, 1)} // Reasonable minimum date
            style={styles.datePicker}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <Button
              title="Continue"
              onPress={handleSaveDOB}
              disabled={loading}
            />
          )}
        </View>
        
        <Text style={styles.privacyNote}>
          Your date of birth is used for age verification and family account management.
          It will not be shared with other users.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  datePicker: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  privacyNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});

export default DOBCollectionScreen;