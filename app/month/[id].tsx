import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useExpenses, Expense } from '../../context/ExpenseContext';

export default function MonthDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { expenses } = useExpenses();
    const router = useRouter();

    const monthName = new Date(2024, parseInt(id!) - 1, 1).toLocaleString('default', { month: 'long' });

    const expensesForMonth = expenses.filter((e) => {
        const d = new Date(e.date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        return month === id;
    });

    // Group by date
    const groupedExpenses = expensesForMonth.reduce((acc, expense) => {
        const dateKey = new Date(expense.date).toLocaleDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
        return acc;
    }, {} as Record<string, Expense[]>);

    // Create sections and sort by date (ascending)
    const sections = Object.keys(groupedExpenses)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((date) => ({
            title: date,
            data: groupedExpenses[date],
        }));

    const renderExpenseItem = ({ item }: { item: Expense }) => (
        <TouchableOpacity onPress={() => router.push({ pathname: '/add-expense', params: { id: item.id } })}>
            <View style={styles.expenseItem}>
                <View style={styles.expenseHeader}>
                    <Text style={styles.expenseName}>{item.name}</Text>
                    <Text style={styles.expensePrice}>€{item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.expenseDetails}>{item.details}</Text>
                <View style={styles.expenseFooter}>
                    <Text style={styles.expenseSubtext}>Net: €{item.expensePrice.toFixed(2)}</Text>
                    <Text style={styles.expenseSubtext}>VAT ({(item.vatRate * 100).toFixed(0)}%): €{item.returnedVat.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: `${monthName} Expenses` }} />
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderExpenseItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{title}</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No expenses for this month.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
    },
    sectionHeader: {
        backgroundColor: '#e0e0e0',
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
    },
    sectionHeaderText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    expenseItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    expenseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    expensePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    expenseDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    expenseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    expenseSubtext: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
