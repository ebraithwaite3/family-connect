// src/components/Header.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import SlideOutMenu from './SlideOutMenu';

const Header = ({ 
  user, 
  onProfilePress, 
  showBackButton = false, 
  onBackPress,
  title = null 
}) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 50, // Account for status bar
      backgroundColor: theme.header,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      shadowColor: theme.shadow.color,
      shadowOffset: theme.shadow.offset,
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: theme.shadow.radius,
      elevation: theme.shadow.elevation,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    centerSection: {
      flex: 2,
      alignItems: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },
    backButton: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginRight: 8,
    },
    backText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    profilePlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    profileInitials: {
      color: theme.text.inverse,
      fontSize: 14,
      fontWeight: 'bold',
    },
    greeting: {
      fontSize: 16,
      color: theme.text.primary,
      fontWeight: '500',
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    iconButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: theme.button.secondary,
    },
    iconText: {
      fontSize: 16,
      color: theme.button.secondaryText,
    },
    themeButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
    },
    themeButtonText: {
      fontSize: 14,
      color: theme.primary,
    },
    hamburgerButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: theme.button.secondary,
    },
    hamburgerText: {
      fontSize: 18,
      color: theme.button.secondaryText,
      lineHeight: 20,
    },
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <View style={styles.container}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          {!showBackButton && user && (
            <TouchableOpacity 
              style={styles.profileContainer} 
              onPress={onProfilePress}
            >
              {user.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitials}>
                    {getInitials(user.fullName)}
                  </Text>
                </View>
              )}
              <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
                {getGreeting()}, {user.fullName?.split(' ')[0] || 'User'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {title && (
            <Text style={styles.headerTitle}>{title}</Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Hamburger Menu */}
          <TouchableOpacity 
            style={styles.hamburgerButton} 
            onPress={() => setIsMenuVisible(!isMenuVisible)}
          >
            <Text style={styles.hamburgerText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide Out Menu */}
      <SlideOutMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onSettingsPress={() => {
          console.log('Settings clicked');
          setIsMenuVisible(false);
        }}
      />
    </>
  );
};

export default Header;