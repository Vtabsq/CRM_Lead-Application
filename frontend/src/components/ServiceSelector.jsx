import React, { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const ServiceSelector = ({ onAddService, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Services');
    const [selectedService, setSelectedService] = useState(null);
    const [editingService, setEditingService] = useState(null);

    // Catalog data from backend
    const [services, setServices] = useState([]);
    const [packages, setPackages] = useState([]);
    const [products, setProducts] = useState([]);

    // Dropdown options from backend
    const [providerOptions, setProviderOptions] = useState([]);
    const [soldByOptions, setSoldByOptions] = useState([]);
    const [externalProviderOptions, setExternalProviderOptions] = useState([]);
    const [discountOptions, setDiscountOptions] = useState([]);

    // State for adding new options
    const [addingNewOption, setAddingNewOption] = useState({
        provider: false,
        sold_by: false,
        external_provider: false,
        discount: false
    });
    const [newOptionValue, setNewOptionValue] = useState({
        provider: '',
        sold_by: '',
        external_provider: '',
        discount: ''
    });

    useEffect(() => {
        loadCatalogData();
        loadDropdownOptions();
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
        }
    };

    const loadDropdownOptions = async () => {
        try {
            console.log('Loading dropdown options from API...');
            const [providerRes, soldByRes, externalProviderRes, discountRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dropdowns/provider`),
                axios.get(`${API_BASE_URL}/api/dropdowns/sold_by`),
                axios.get(`${API_BASE_URL}/api/dropdowns/external_provider`),
                axios.get(`${API_BASE_URL}/api/dropdowns/discount`)
            ]);

            console.log('Dropdown options loaded:', {
                provider: providerRes.data.options,
                soldBy: soldByRes.data.options,
                externalProvider: externalProviderRes.data.options,
                discount: discountRes.data.options
            });

            setProviderOptions(providerRes.data.options || []);
            setSoldByOptions(soldByRes.data.options || []);
            setExternalProviderOptions(externalProviderRes.data.options || []);
            setDiscountOptions(discountRes.data.options || []);
        } catch (error) {
            console.error('Error loading dropdown options:', error);
            // Set default options if API fails
            setProviderOptions([
                { id: '1', value: 'Provider 1' },
                { id: '2', value: 'Provider 2' }
            ]);
            setSoldByOptions([
                { id: '1', value: 'Company' },
                { id: '2', value: 'Partner' }
            ]);
            setExternalProviderOptions([
                { id: '1', value: 'External Provider 1' },
                { id: '2', value: 'External Provider 2' }
            ]);
            setDiscountOptions([
                { id: '1', value: '500' },
                { id: '2', value: '1000' },
                { id: '3', value: '2000' }
            ]);
        }
    };

    const handleAddNewOption = async (category) => {
        const value = newOptionValue[category];
        console.log('=== ADD NEW OPTION ===');
        console.log('Category:', category);
        console.log('Value:', value);
        console.log('API URL:', `${API_BASE_URL}/api/dropdowns/${category}`);

        if (!value || !value.trim()) {
            alert('Please enter a value');
            return;
        }

        try {
            console.log('Sending POST request...');
            const response = await axios.post(`${API_BASE_URL}/api/dropdowns/${category}`, {
                value: value.trim()
            });
            console.log('API Response:', response.data);

            // Reload dropdown options
            console.log('Reloading dropdown options...');
            await loadDropdownOptions();

            // Reset state
            setAddingNewOption({ ...addingNewOption, [category]: false });
            setNewOptionValue({ ...newOptionValue, [category]: '' });

            // Update the editing service with the new value
            if (editingService) {
                if (category === 'provider') {
                    handleFieldChange('provider', value.trim());
                } else if (category === 'sold_by') {
                    handleFieldChange('sold_by', value.trim());
                } else if (category === 'external_provider') {
                    handleFieldChange('external_provider', value.trim());
                } else if (category === 'discount') {
                    handleFieldChange('discount', value.trim());
                }
            }

            console.log('Option added successfully!');
            alert('Option added successfully!');
        } catch (error) {
            console.error('=== ERROR ADDING OPTION ===');
            console.error('Error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            alert(`Failed to add new option: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleCancelAddOption = (category) => {
        setAddingNewOption({ ...addingNewOption, [category]: false });
        setNewOptionValue({ ...newOptionValue, [category]: '' });
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

    const filteredServices = getCurrentItems().filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleServiceClick = (service) => {
        setSelectedService(service);
        setEditingService({
            service_name: service.name,
            provider: '',
            perform_date: new Date().toISOString().split('T')[0],
            price: service.price,
            quantity: 1,
            discount: 0,
            tax_type: 'Exclusive of tax',
            tax_amount: 0,
            amount: service.price,
            sold_by: '',
            external_provider: '',
            notes: ''
        });
    };

    const handleFieldChange = (field, value) => {
        if (!editingService) return;

        const updated = { ...editingService, [field]: value };

        // Recalculate amount
        const price = parseFloat(updated.price) || 0;
        const qty = parseInt(updated.quantity) || 1;
        const discount = parseFloat(updated.discount) || 0;
        const taxAmount = parseFloat(updated.tax_amount) || 0;

        let amount = price * qty;
        amount -= discount;

        if (updated.tax_type === 'Exclusive of tax') {
            amount += taxAmount;
        }

        updated.amount = amount;
        setEditingService(updated);
    };

    const handleAddToInvoice = () => {
        if (editingService) {
            onAddService(editingService);
            setSelectedService(null);
            setEditingService(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Render dropdown with add new option functionality
    const renderEditableDropdown = (category, label, value, options) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, '_');

        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                {addingNewOption[categoryKey] ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newOptionValue[categoryKey] || ''}
                            onChange={(e) => setNewOptionValue({ ...newOptionValue, [categoryKey]: e.target.value })}
                            placeholder={`Enter new ${label.toLowerCase()}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddNewOption(categoryKey);
                                }
                            }}
                        />
                        <button
                            onClick={() => handleAddNewOption(categoryKey)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => handleCancelAddOption(categoryKey)}
                            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select
                            value={value || ''}
                            onChange={(e) => {
                                if (e.target.value === '__ADD_NEW__') {
                                    setAddingNewOption({ ...addingNewOption, [categoryKey]: true });
                                } else {
                                    handleFieldChange(categoryKey, e.target.value);
                                }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        >
                            <option value="">Select {label}</option>
                            {options.map((option) => (
                                <option key={option.id} value={option.value}>
                                    {option.value}
                                </option>
                            ))}
                            <option value="__ADD_NEW__" className="text-blue-600 font-semibold">
                                + Add New {label}
                            </option>
                        </select>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-full">
            {/* Left Side - Service Editing Form */}
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedService && editingService ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedService.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setSelectedService(null);
                                    setEditingService(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Service/Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service/Product
                            </label>
                            <input
                                type="text"
                                value={editingService.service_name}
                                onChange={(e) => handleFieldChange('service_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Provider - Editable Dropdown */}
                            {renderEditableDropdown('provider', 'Provider', editingService.provider, providerOptions)}

                            {/* Perform Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Perform Date
                                </label>
                                <input
                                    type="date"
                                    value={editingService.perform_date}
                                    onChange={(e) => handleFieldChange('perform_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={editingService.price}
                                    onChange={(e) => handleFieldChange('price', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Qty
                                </label>
                                <input
                                    type="number"
                                    value={editingService.quantity}
                                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Tax Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Price is
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tax_type"
                                        value="Inclusive of tax"
                                        checked={editingService.tax_type === 'Inclusive of tax'}
                                        onChange={(e) => handleFieldChange('tax_type', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Inclusive of tax</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tax_type"
                                        value="Exclusive of tax"
                                        checked={editingService.tax_type === 'Exclusive of tax'}
                                        onChange={(e) => handleFieldChange('tax_type', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Exclusive of tax</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tax_type"
                                        value="Non-taxable"
                                        checked={editingService.tax_type === 'Non-taxable'}
                                        onChange={(e) => handleFieldChange('tax_type', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Non-taxable</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Discount - Editable Dropdown */}
                            {renderEditableDropdown('discount', 'Discount', editingService.discount, discountOptions)}

                            {/* Tax */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax
                                </label>
                                {editingService.tax_type === 'Non-taxable' ? (
                                    <input
                                        type="text"
                                        value="NOT APPLICABLE"
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    />
                                ) : (
                                    <select
                                        value={editingService.tax_amount}
                                        onChange={(e) => handleFieldChange('tax_amount', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                    >
                                        <option value="0">Select Tax</option>
                                        <option value="0">0%</option>
                                        <option value={editingService.price * 0.05}>5%</option>
                                        <option value={editingService.price * 0.12}>12%</option>
                                        <option value={editingService.price * 0.18}>18%</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount
                            </label>
                            <input
                                type="text"
                                value={formatCurrency(editingService.amount)}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-green-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Sold By - Editable Dropdown */}
                            {renderEditableDropdown('sold_by', 'Sold By', editingService.sold_by, soldByOptions)}

                            {/* External Provider - Editable Dropdown */}
                            {renderEditableDropdown('external_provider', 'External Provider', editingService.external_provider, externalProviderOptions)}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <textarea
                                value={editingService.notes}
                                onChange={(e) => handleFieldChange('notes', e.target.value)}
                                placeholder="Enter Notes/Instruction"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddToInvoice}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Add to Invoice
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <Search className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg font-medium">Select a service from the right panel</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side - Service List */}
            <div className="w-96 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search Services/Packages/Products"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {['Services', 'Packages', 'Products'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Service List */}
                <div className="space-y-2">
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>No items found</p>
                            <p className="text-sm mt-1">Add items in Service Catalog</p>
                        </div>
                    ) : (
                        filteredServices.map(service => (
                            <div
                                key={service.id}
                                onClick={() => handleServiceClick(service)}
                                className={`p-3 bg-white rounded-lg border-2 cursor-pointer transition-all ${selectedService?.id === service.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">₹{formatCurrency(service.price)}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">0</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceSelector;
