import { Stack } from "expo-router";
import { ExpenseProvider } from "../context/ExpenseContext";

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="add-expense" options={{ presentation: 'modal', title: 'Add Expense' }} />
        <Stack.Screen name="month/[id]" options={{ title: 'Month Details' }} />
      </Stack>
    </ExpenseProvider>
  );
}
