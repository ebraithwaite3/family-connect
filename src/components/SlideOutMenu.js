// src/components/SlideOutMenu.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.75; // 75% of screen width
const HEADER_HEIGHT = 100; // Approximate header height

const SlideOutMenu = ({ isVisible, onClose, onSettingsPress }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const heightAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Expand height
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 140, // Taller to fit both items properly
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Collapse height
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    menuContainer: {
      position: 'absolute',
      top: HEADER_HEIGHT,
      right: 8, // Closer to edge
      width: MENU_WIDTH,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      zIndex: 1001,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.shadow.opacity * 3,
      shadowRadius: theme.shadow.radius * 2,
      elevation: theme.shadow.elevation * 3,
      overflow: 'hidden', // Important for height animation
    },
    menuContent: {
      paddingVertical: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16, // More padding for less bunched look
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuItemIcon: {
      fontSize: 18,
      marginRight: 12,
      width: 24,
      textAlign: 'center',
    },
    menuItemText: {
      fontSize: 16,
      color: theme.text.primary,
      fontWeight: '500',
    },
    menuItemSubtext: {
      fontSize: 12,
      color: theme.text.secondary,
      marginTop: 2,
    },
    switchContainer: {
      marginLeft: 12,
    },
  });

  if (!isVisible) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
            }
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            height: heightAnim,
          }
        ]}
      >
        {/* Content - No header */}
        <View style={styles.menuContent}>
          {/* Dark Mode Toggle */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={[styles.menuItemIcon, { color: theme.text.primary }]}>
                {isDarkMode ? '🌙' : '☀️'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemText}>Dark Mode</Text>
                <Text style={styles.menuItemSubtext}>
                  {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: theme.border, 
                  true: theme.primaryLight 
                }}
                thumbColor={isDarkMode ? theme.primary : theme.text.tertiary}
                ios_backgroundColor={theme.border}
              />
            </View>
          </View>

          {/* Settings */}
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomWidth: 0 }]} // Remove border on last item
            onPress={onSettingsPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={[styles.menuItemIcon, { color: theme.text.primary }]}>
                ⚙️
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemText}>Settings</Text>
                <Text style={styles.menuItemSubtext}>
                  App preferences and account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default SlideOutMenu;