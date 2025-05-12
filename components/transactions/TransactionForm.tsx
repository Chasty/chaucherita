import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { DollarSign, Calendar, Tag, FileText, X } from "lucide-react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomBottomSheet } from "@/components/ui/BottomSheet";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Transaction } from "@/types";
import { categories } from "@/constants/categories";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { formatDate } from "@/utils/date";
import { DatePickerBottomSheet } from "@/components/ui/BottomSheet";

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "expense"
  );
  const [amount, setAmount] = useState(initialData?.amount.toString() || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(date);

  const [errors, setErrors] = useState({
    amount: "",
    description: "",
    category: "",
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { amount: "", description: "", category: "" };

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        amount: Number(amount),
        type,
        description,
        category,
        date: date.toISOString(),
        notes,
      });
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    setDate(tempDate);
    setShowDatePicker(false);
  };

  const showDatePickerModal = () => {
    setTempDate(date);
    setShowDatePicker(true);
  };

  const categoryList =
    type === "income" ? categories.income : categories.expense;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor:
                type === "income" ? themeColors.income : "transparent",
              borderColor: themeColors.income,
            },
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.typeText,
              { color: type === "income" ? "#fff" : themeColors.income },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            {
              backgroundColor:
                type === "expense" ? themeColors.expense : "transparent",
              borderColor: themeColors.expense,
            },
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.typeText,
              { color: type === "expense" ? "#fff" : themeColors.expense },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        leftIcon={<DollarSign size={20} color={themeColors.subtext} />}
        error={errors.amount}
      />

      <Input
        label="Description"
        placeholder="What was this transaction for?"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
      />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          onPress={showDatePickerModal}
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            {formatDate(date.toISOString())}
          </Text>
        </TouchableOpacity>
      </View>

      <DatePickerBottomSheet
        visible={showDatePicker}
        initialDate={tempDate}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(selectedDate) => {
          setDate(selectedDate);
          setShowDatePicker(false);
        }}
        title="Select Date"
        maximumDate={new Date()}
      />

      <Text style={[styles.label, { color: themeColors.text }]}>Category</Text>
      <View style={styles.categoriesContainer}>
        {categoryList.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor:
                  category === cat.id
                    ? type === "income"
                      ? `${themeColors.income}20`
                      : `${themeColors.expense}20`
                    : theme === "dark"
                    ? themeColors.card
                    : "#F3F4F6",
                borderColor:
                  category === cat.id
                    ? type === "income"
                      ? themeColors.income
                      : themeColors.expense
                    : "transparent",
              },
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    category === cat.id
                      ? type === "income"
                        ? themeColors.income
                        : themeColors.expense
                      : themeColors.text,
                },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category ? (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {errors.category}
        </Text>
      ) : null}

      <Input
        label="Notes (Optional)"
        placeholder="Add any additional details"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={styles.notesInput}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title={initialData ? "Update" : "Save"}
          onPress={handleSubmit}
          isLoading={isLoading}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  datePicker: {
    height: Platform.OS === "ios" ? 200 : "auto",
  },
});
