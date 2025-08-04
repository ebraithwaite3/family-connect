// src/hooks/useTheme.js
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ThemeContext from '../contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for creating themed styles
export const useThemedStyles = (styleFunction) => {
  const { theme, getSpacing, getTypography, getBorderRadius } = useTheme();
  
  return StyleSheet.create(
    styleFunction({
      theme,
      spacing: getSpacing,
      typography: getTypography,
      borderRadius: getBorderRadius
    })
  );
};

// Helper hook for common calendar styles
export const useCalendarStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    calendarGrid: {
      borderColor: theme.calendar.gridBorder,
      borderWidth: 1,
    },
    todayCell: {
      backgroundColor: theme.calendar.todayBackground,
    },
    todayText: {
      color: theme.calendar.todayText,
      fontWeight: 'bold',
    },
    selectedCell: {
      backgroundColor: theme.calendar.selectedBackground,
    },
    selectedText: {
      color: theme.calendar.selectedText,
      fontWeight: 'bold',
    },
    weekendText: {
      color: theme.calendar.weekendText,
    },
    otherMonthText: {
      color: theme.calendar.otherMonthText,
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 1,
    }
  });
};

export default useTheme;