import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, Edit3, Upload } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const SchemaEditor = () => {
    const [schemaType, setSchemaType] = useState('enquiry'); // 'enquiry' or 'admission'
    const [schema, setSchema] = useState([]);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewRows, setPreviewRows] = useState(null);

    const fetchFields = async (type) => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_BASE_URL}/get_fields?type=${type}`);
            setSchema(response.data.fields || []);
        } catch (err) {
            setError('Failed to load fields.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields(schemaType);
    }, [schemaType]);

    const addField = () => {
        setSchema(prev => {
            const nextIndex = prev.length + 1;
            const newFieldName = `New Field ${nextIndex}`;
            return [...prev, {
                name: newFieldName,
                label: newFieldName,
                data_type: 'text',
                options: []
            }];
        });
    };

    const deleteField = (index) => {
        setSchema(prev => prev.filter((_, i) => i !== index));
    };

    const updateField = (index, updater) => {
        setSchema(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updater };
            return next;
        });
    };

    const addDropdownOption = (fieldIndex) => {
        setSchema(prev => {
            const next = [...prev];
            const field = next[fieldIndex];
            const oldOpts = field.options || [];
            next[fieldIndex] = { ...field, options: [...oldOpts, 'New Option'] };
            return next;
        });
    };

    const updateDropdownOption = (fieldIndex, optIndex, value) => {
        setSchema(prev => {
            const next = [...prev];
            const field = next[fieldIndex];
            const newOpts = [...(field.options || [])];
            newOpts[optIndex] = value;
            next[fieldIndex] = { ...field, options: newOpts };
            return next;
        });
    };

    const deleteDropdownOption = (fieldIndex, optIndex) => {
        setSchema(prev => {
            const next = [...prev];
            const field = next[fieldIndex];
            const newOpts = [...(field.options || [])];
            newOpts.splice(optIndex, 1);
            next[fieldIndex] = { ...field, options: newOpts };
            return next;
        });
    };

    const normalizeFieldName = (name) =>
        name.toLowerCase().replace(/\s+/g, "_");

    const saveSchema = async () => {
        // LOG PAYLOAD AS REQUESTED
        console.log("SCHEMA PAYLOAD:", schema);

        try {
            setError('');
            setMessage(null);

            // NORMALIZE FIELD NAMES
            const normalizedSchema = schema.map(f => ({
                ...f,
                name: normalizeFieldName(f.name)
            }));

            // CHECK FOR DUPLICATES AND DEDUPLICATE
            const uniqueSchema = [];
            const seen = new Set();

            for (const field of normalizedSchema) {
                if (!seen.has(field.name)) {
                    seen.add(field.name);
                    uniqueSchema.push(field);
                }
            }

            // Re-assign to use unique schema for saving
            const finalPayload = uniqueSchema;

            await axios.post(`${API_BASE_URL}/update_fields?type=${schemaType}`, { fields: finalPayload });
            setMessage('Schema saved successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Save Error:", err);
            setError('Failed to save schema.');
        }
    };

    return (
        <div className="w-full bg-white shadow-xl p-4 mb-2 border-2 border-blue-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-2xl font-semibold text-blue-700">Field Schema</h3>
                    <p className="text-sm text-gray-600 mt-1">Define names, labels, types, and options</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSchemaType('enquiry')}
                        className={`px-4 py-1.5 rounded-l-md font-semibold ${schemaType === 'enquiry' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Enquiry
                    </button>
                    <button
                        onClick={() => setSchemaType('admission')}
                        className={`px-4 py-1.5 rounded-r-md font-semibold ${schemaType === 'admission' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Patient Admission
                    </button>
                    <button onClick={addField} className="flex items-center px-3 py-1.5 bg-green-600 text-white text-base shadow hover:bg-green-700 ml-4">
                        <Plus className="w-5 h-5 mr-2" />Add Field
                    </button>
                    <button onClick={saveSchema} className="flex items-center px-4 py-1.5 bg-purple-600 text-white text-base shadow hover:bg-purple-700 ml-2">
                        <Save className="w-5 h-5 mr-2" />Save Schema
                    </button>
                </div>
            </div>

            {/* Messages */}
            {message && <div className="text-green-600 font-bold mb-4">{message}</div>}
            {error && <div className="text-red-600 font-bold mb-4">{error}</div>}

            {/* Table */}
            <div className="overflow-auto max-h-[75vh]">
                <table className="min-w-full border">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="p-3 text-left border">Field Name</th>
                            <th className="p-3 text-left border">Label</th>
                            <th className="p-3 text-left border">Data Type</th>
                            <th className="p-3 text-left border">Dropdown Options</th>
                            <th className="p-3 text-left border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schema.map((f, idx) => (
                            <tr key={`${f.name}-${idx}`} className="border-t">
                                <td className="p-2 border"><input value={f.name} onChange={(e) => updateField(idx, { name: e.target.value })} className="w-full border rounded px-2 py-1" /></td>
                                <td className="p-2 border"><input value={f.label || ''} onChange={(e) => updateField(idx, { label: e.target.value })} className="w-full border rounded px-2 py-1" /></td>
                                <td className="p-2 border">
                                    <select value={f.data_type || 'text'} onChange={(e) => updateField(idx, { data_type: e.target.value, options: e.target.value === 'dropdown' ? (f.options || []) : [] })} className="w-full border rounded px-2 py-1">
                                        <option value="text">text</option>
                                        <option value="number">number</option>
                                        <option value="date">date</option>
                                        <option value="email">email</option>
                                        <option value="phone">phone</option>
                                        <option value="boolean">boolean</option>
                                        <option value="dropdown">dropdown</option>
                                    </select>
                                </td>
                                <td className="p-2 border">
                                    {f.data_type === 'dropdown' ? (
                                        <div className="space-y-2">
                                            {(f.options || []).map((opt, oi) => (
                                                <div key={oi} className="flex gap-2">
                                                    <input value={opt} onChange={(e) => updateDropdownOption(idx, oi, e.target.value)} className="flex-1 border rounded px-2 py-1" />
                                                    <button onClick={() => deleteDropdownOption(idx, oi)} className="px-2 py-1 border rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addDropdownOption(idx)} className="px-3 py-1 text-base border rounded bg-gray-50">Add option</button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="p-2 border text-right">
                                    <button onClick={() => deleteField(idx)} className="px-3 py-1 border rounded text-red-700 hover:bg-red-50">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SchemaEditor;
