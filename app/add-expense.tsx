import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpenses, VatOption } from '../context/ExpenseContext';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addExpense, updateExpense, deleteExpense, expenses } = useExpenses();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [vatRate, setVatRate] = useState<number>(0.24);
    const [customVat, setCustomVat] = useState('');
    const [isCustomVat, setIsCustomVat] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (id) {
            const expenseToEdit = expenses.find(e => e.id === id);
            if (expenseToEdit) {
                setName(expenseToEdit.name);
                setPrice(expenseToEdit.price.toString());
                setVatRate(expenseToEdit.vatRate);
                setDate(new Date(expenseToEdit.date));
                setDetails(expenseToEdit.details);

                if (![0.06, 0.13, 0.24].includes(expenseToEdit.vatRate)) {
                    setIsCustomVat(true);
                    setCustomVat((expenseToEdit.vatRate * 100).toString());
                }

                router.setParams({ title: 'Edit Expense' });
            }
        }
    }, [id, expenses]);

    const handleVatSelection = (rate: number) => {
        setIsCustomVat(false);
        setVatRate(rate);
        setCustomVat('');
    };

    const handleCustomVat = (text: string) => {
        setCustomVat(text);
        const rate = parseFloat(text);
        if (!isNaN(rate)) {
            setVatRate(rate / 100);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleSubmit = () => {
        if (!name || !price) {
            Alert.alert('Error', 'Please fill in Name and Price');
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            Alert.alert('Error', 'Invalid Price');
            return;
        }

        if (id) {
            updateExpense({
                id,
                name,
                price: priceNum,
                vatRate,
                date: date.toISOString(),
                details,
                expensePrice: 0, // Recalculated in context
                returnedVat: 0, // Recalculated in context
            });
        } else {
            addExpense({
                name,
                price: priceNum,
                vatRate,
                date: date.toISOString(),
                details,
            });
        }

        router.back();
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        if (id) {
                            deleteExpense(id);
                            router.back();
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Expense Name"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Price (Total)</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Total Price"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>VAT</Text>
                <View style={styles.vatContainer}>
                    {[0.06, 0.13, 0.24].map((rate) => (
                        <TouchableOpacity
                            key={rate}
                            style={[
                                styles.vatButton,
                                !isCustomVat && vatRate === rate && styles.vatButtonActive,
                            ]}
                            onPress={() => handleVatSelection(rate)}
                        >
                            <Text style={[
                                styles.vatButtonText,
                                !isCustomVat && vatRate === rate && styles.vatButtonTextActive
                            ]}>
                                {rate * 100}%
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.customVatContainer}>
                        <TouchableOpacity
                            style={[
                                styles.vatButton,
                                isCustomVat && styles.vatButtonActive,
                                { marginRight: 5 }
                            ]}
                            onPress={() => setIsCustomVat(true)}
                        >
                            <Text style={[
                                styles.vatButtonText,
                                isCustomVat && styles.vatButtonTextActive
                            ]}>
                                Custom
                            </Text>
                        </TouchableOpacity>
                        {isCustomVat && (
                            <TextInput
                                style={styles.customVatInput}
                                value={customVat}
                                onChangeText={handleCustomVat}
                                placeholder="%"
                                keyboardType="numeric"
                            />
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Details</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={details}
                    onChangeText={setDetails}
                    placeholder="Additional details..."
                    multiline
                    numberOfLines={4}
                />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{id ? 'Update Expense' : 'Add Expense'}</Text>
            </TouchableOpacity>

            {id && (
                <TouchableOpacity style={[styles.submitButton, styles.deleteButton]} onPress={handleDelete}>
                    <Text style={styles.submitButtonText}>Delete Expense</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    vatContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    vatButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        marginRight: 10,
        marginBottom: 10,
    },
    vatButtonActive: {
        backgroundColor: '#007AFF',
    },
    vatButtonText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    vatButtonTextActive: {
        color: '#fff',
    },
    customVatContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    customVatInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        width: 60,
        textAlign: 'center',
        marginBottom: 10,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        marginTop: 10,
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
