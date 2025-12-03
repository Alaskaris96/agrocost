import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useExpenses } from '../context/ExpenseContext';
import { Ionicons } from '@expo/vector-icons';

const months = [
  { id: '01', name: 'January' },
  { id: '02', name: 'February' },
  { id: '03', name: 'March' },
  { id: '04', name: 'April' },
  { id: '05', name: 'May' },
  { id: '06', name: 'June' },
  { id: '07', name: 'July' },
  { id: '08', name: 'August' },
  { id: '09', name: 'September' },
  { id: '10', name: 'October' },
  { id: '11', name: 'November' },
  { id: '12', name: 'December' },
];

export default function HomeScreen() {
  const { expenses, totalExpensePrice, totalReturnedVat } = useExpenses();
  const router = useRouter();

  const getMonthTotals = (monthId: string) => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return (d.getMonth() + 1).toString().padStart(2, '0') === monthId;
    });

    const expenseTotal = monthExpenses.reduce((sum, e) => sum + e.expensePrice, 0);
    const vatTotal = monthExpenses.reduce((sum, e) => sum + e.returnedVat, 0);

    return { expenseTotal, vatTotal };
  };

  const renderMonthItem = ({ item }: { item: { id: string; name: string } }) => {
    const { expenseTotal, vatTotal } = getMonthTotals(item.id);

    return (
      <Link href={`/month/${item.id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>{item.name}</Text>
          <View style={styles.cardStats}>
            <Text style={styles.statText}>Exp: €{expenseTotal.toFixed(2)}</Text>
            <Text style={styles.statText}>VAT: €{vatTotal.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AgroCost',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.totalsContainer}>
                <Text style={styles.totalText}>Exp: €{totalExpensePrice.toFixed(2)}</Text>
                <Text style={styles.totalText}>VAT: €{totalReturnedVat.toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/add-expense')} style={styles.addButton}>
                <Ionicons name="add-circle" size={32} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <FlatList
        data={months}
        renderItem={renderMonthItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalsContainer: {
    marginRight: 15,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  listContent: {
    paddingVertical: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 120,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardStats: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});
