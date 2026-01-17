import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const ServiceCatalog = () => {
    const [activeTab, setActiveTab] = useState('Services');
    const [services, setServices] = useState([]);
    const [packages, setPackages] = useState([]);
    const [products, setProducts] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', price: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadCatalogData();
    }, []);

    const loadCatalogData = async () => {
        try {
            const [servicesRes, packagesRes, productsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/catalog/services`),
                axios.get(`${API_BASE_URL}/api/catalog/packages`),
                axios.get(`${API_BASE_URL}/api/catalog/products`)
            ]);

            setServices(servicesRes.data.items || []);
            setPackages(packagesRes.data.items || []);
            setProducts(productsRes.data.items || []);
        } catch (error) {
            console.error('Error loading catalog:', error);
            setServices([]);
            setPackages([]);
            setProducts([]);
        }
    };

    const getCurrentItems = () => {
        switch (activeTab) {
            case 'Services':
                return services;
            case 'Packages':
                return packages;
            case 'Products':
                return products;
            default:
                return [];
        }
    };

    const setCurrentItems = (items) => {
        switch (activeTab) {
            case 'Services':
                setServices(items);
                break;
            case 'Packages':
                setPackages(items);
                break;
            case 'Products':
                setProducts(items);
                break;
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.price) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const category = activeTab.toLowerCase();
            const response = await axios.post(`${API_BASE_URL}/api/catalog/${category}`, {
                name: newItem.name,
                price: parseFloat(newItem.price)
            });

            const currentItems = getCurrentItems();
            setCurrentItems([...currentItems, response.data]);
            setNewItem({ name: '', price: '' });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item. Please try again.');
        }
    };

    const handleEdit = (item) => {
        setEditingItem({ ...item });
    };

    const handleSaveEdit = async () => {
        try {
            const category = activeTab.toLowerCase();
            await axios.put(`${API_BASE_URL}/api/catalog/${category}/${editingItem.id}`, {
                name: editingItem.name,
                price: parseFloat(editingItem.price)
            });

            const currentItems = getCurrentItems();
            const updatedItems = currentItems.map(item =>
                item.id === editingItem.id ? editingItem : item
            );
            setCurrentItems(updatedItems);
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const category = activeTab.toLowerCase();
            await axios.delete(`${API_BASE_URL}/api/catalog/${category}/${id}`);

            const currentItems = getCurrentItems();
            const updatedItems = currentItems.filter(item => item.id !== id);
            setCurrentItems(updatedItems);
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleCancelAdd = () => {
        setShowAddForm(false);
        setNewItem({ name: '', price: '' });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-800">Service Catalog Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage services, packages, and products</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex gap-4">
                    {['Services', 'Packages', 'Products'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setShowAddForm(false);
                                setEditingItem(null);
                            }}
                            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Add Button */}
                    <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-700">{activeTab} List</h2>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add {activeTab.slice(0, -1)}
                        </button>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-blue-200">
                            <h3 className="font-semibold text-gray-700 mb-3">Add New {activeTab.slice(0, -1)}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter price"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleAdd}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelAdd}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Price (₹)
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {getCurrentItems().length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                            No {activeTab.toLowerCase()} found. Click "Add {activeTab.slice(0, -1)}" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    getCurrentItems().map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            {editingItem && editingItem.id === item.id ? (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={editingItem.name}
                                                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={editingItem.price}
                                                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="text-green-600 hover:text-green-800 mr-3"
                                                        >
                                                            <Save className="w-4 h-4 inline" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-gray-600 hover:text-gray-800"
                                                        >
                                                            <X className="w-4 h-4 inline" />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">₹{item.price}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                                        >
                                                            <Edit2 className="w-4 h-4 inline" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-4 h-4 inline" />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCatalog;
