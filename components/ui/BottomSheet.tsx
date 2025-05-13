import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "./Button";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  snapPoints?: string[];
}

export const CustomBottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  snapPoints = ["50%"],
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const memoizedSnapPoints = useMemo(() => ["50%"], []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={memoizedSnapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: themeColors.card }}
      handleIndicatorStyle={{ backgroundColor: themeColors.border }}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {title}
          </Text>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.footer}>
          <Button
            title={cancelLabel}
            onPress={onClose}
            variant="outline"
            style={styles.button}
          />
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            style={styles.button}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  button: {
    flex: 1,
  },
});

interface DatePickerBottomSheetProps {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export const DatePickerBottomSheet: React.FC<DatePickerBottomSheetProps> = ({
  visible,
  initialDate,
  onClose,
  onConfirm,
  title = "Select Date",
  maximumDate,
  minimumDate,
}) => {
  const [tempDate, setTempDate] = React.useState(initialDate);
  const { theme } = useThemeStore();

  React.useEffect(() => {
    setTempDate(initialDate);
  }, [initialDate, visible]);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempDate);
  };

  return (
    <CustomBottomSheet
      visible={visible}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
    >
      {/* Overlay for dark mode */}
      {theme === "dark" && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
          pointerEvents="none"
        />
      )}
      <DateTimePicker
        value={tempDate}
        mode="date"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={handleDateChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        style={{ height: Platform.OS === "ios" ? 200 : "auto", zIndex: 2 }}
      />
    </CustomBottomSheet>
  );
};
