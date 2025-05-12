import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Filter } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Period } from "@/types";

interface FilterBarProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  onFilterPress: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedPeriod,
  onPeriodChange,
  onFilterPress,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const periods: { label: string; value: Period }[] = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 15 Days", value: "last15" },
    { label: "Last 30 Days", value: "last30" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  selectedPeriod === period.value
                    ? themeColors.primary
                    : theme === "dark"
                    ? themeColors.card
                    : "#F3F4F6",
              },
            ]}
            onPress={() => onPeriodChange(period.value)}
          >
            <Text
              style={[
                styles.periodText,
                {
                  color:
                    selectedPeriod === period.value ? "#fff" : themeColors.text,
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: theme === "dark" ? themeColors.card : "#F3F4F6",
          },
        ]}
        onPress={onFilterPress}
      >
        <Filter size={18} color={themeColors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
