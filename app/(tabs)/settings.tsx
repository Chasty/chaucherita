import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { colors } from "@/constants/colors";
import {
  Moon,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Download,
  Trash2,
} from "lucide-react-native";
import { useTransactionStore } from "@/stores/transaction-store";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const themeColors = colors[theme];
  const { transactions } = useTransactionStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          logout(() => router.replace("/(auth)/login"));
        },
        style: "destructive",
      },
    ]);
  };

  const handleExportData = () => {
    // In a real app, this would export data to Excel/PDF
    Alert.alert(
      "Export Data",
      "This feature would export your financial data to Excel or PDF.",
      [{ text: "OK" }]
    );
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "Are you sure you want to delete all your financial data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            // In a real app, this would delete all user data
            Alert.alert(
              "Data Deleted",
              "All your financial data has been deleted."
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: `${themeColors.primary}20` },
            ]}
          >
            <Text
              style={[styles.profileInitial, { color: themeColors.primary }]}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: themeColors.text }]}>
              {user?.name || "User"}
            </Text>
            <Text style={[styles.profileEmail, { color: themeColors.subtext }]}>
              {user?.email || "user@example.com"}
            </Text>
          </View>
        </View>

        <Button
          title="Edit Profile"
          variant="outline"
          leftIcon={<User size={18} color={themeColors.primary} />}
          style={styles.profileButton}
        />
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Preferences
        </Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{
                false: "#E5E7EB",
                true: `${themeColors.primary}80`,
              }}
              thumbColor={theme === "dark" ? themeColors.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={true}
              trackColor={{
                false: "#E5E7EB",
                true: `${themeColors.primary}80`,
              }}
              thumbColor={true ? themeColors.primary : "#f4f3f4"}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Data
        </Text>

        <Card style={styles.settingCard}>
          <Button
            title="Export Data"
            variant="outline"
            leftIcon={<Download size={18} color={themeColors.primary} />}
            style={styles.dataButton}
            onPress={handleExportData}
          />

          <Button
            title="Delete All Data"
            variant="danger"
            leftIcon={<Trash2 size={18} color="#fff" />}
            style={styles.dataButton}
            onPress={handleDeleteAllData}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          About
        </Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Privacy Policy
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FileText size={20} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Terms of Service
              </Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <HelpCircle size={20} color={themeColors.text} />
              <Text style={[styles.settingText, { color: themeColors.text }]}>
                Help & Support
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <Button
        title="Logout"
        variant="outline"
        leftIcon={<LogOut size={18} color={themeColors.error} />}
        style={[styles.logoutButton, { borderColor: themeColors.error }]}
        textStyle={{ color: themeColors.error }}
        onPress={handleLogout}
      />

      <Text style={[styles.versionText, { color: themeColors.subtext }]}>
        Version 0.0.1 yara
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  profileButton: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  settingCard: {
    padding: 0,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  dataButton: {
    margin: 16,
  },
  logoutButton: {
    marginBottom: 24,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
  },
});
