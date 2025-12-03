import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VatOption = 0.06 | 0.13 | 0.24 | number;

export interface Expense {
    id: string;
    name: string;
    price: number; // This is the TOTAL price
    vatRate: number;
    date: string; // ISO string
    details: string;
    expensePrice: number; // Calculated: price / (1 + vatRate)
    returnedVat: number; // Calculated: price - expensePrice
}

interface ExpenseContextType {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id' | 'expensePrice' | 'returnedVat'>) => void;
    loading: boolean;
    totalExpensePrice: number;
    totalReturnedVat: number;
    deleteExpense: (id: string) => void;
    updateExpense: (expense: Expense) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const storedExpenses = await AsyncStorage.getItem('@expenses');
            if (storedExpenses) {
                setExpenses(JSON.parse(storedExpenses));
            }
        } catch (e) {
            console.error("Failed to load expenses", e);
        } finally {
            setLoading(false);
        }
    };

    const saveExpenses = async (newExpenses: Expense[]) => {
        try {
            await AsyncStorage.setItem('@expenses', JSON.stringify(newExpenses));
        } catch (e) {
            console.error("Failed to save expenses", e);
        }
    };

    const addExpense = (newExpenseData: Omit<Expense, 'id' | 'expensePrice' | 'returnedVat'>) => {
        const expensePrice = newExpenseData.price / (1 + newExpenseData.vatRate);
        const returnedVat = newExpenseData.price - expensePrice;

        const newExpense: Expense = {
            ...newExpenseData,
            id: Date.now().toString(), // Simple ID generation
            expensePrice,
            returnedVat,
        };

        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        saveExpenses(updatedExpenses);
        saveExpenses(updatedExpenses);
    };

    const deleteExpense = (id: string) => {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        saveExpenses(updatedExpenses);
    };

    const updateExpense = (updatedExpense: Expense) => {
        const expensePrice = updatedExpense.price / (1 + updatedExpense.vatRate);
        const returnedVat = updatedExpense.price - expensePrice;

        const finalExpense = {
            ...updatedExpense,
            expensePrice,
            returnedVat
        };

        const updatedExpenses = expenses.map(e => e.id === updatedExpense.id ? finalExpense : e);
        setExpenses(updatedExpenses);
        saveExpenses(updatedExpenses);
    };

    const totalExpensePrice = expenses.reduce((sum, expense) => sum + expense.expensePrice, 0);
    const totalReturnedVat = expenses.reduce((sum, expense) => sum + expense.returnedVat, 0);

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, loading, totalExpensePrice, totalReturnedVat, deleteExpense, updateExpense }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};
