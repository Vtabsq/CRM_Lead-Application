import React from 'react';

const DynamicForm = ({ fields, formData, onChange, layout = 'grid' }) => {
    if (!fields || fields.length === 0) return null;

    const renderField = (field, index) => {
        const val = formData[field.name] || '';
        const label = field.label || field.name;

        // Common styles
        const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
        const inputStyle = "w-full h-9 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500";

        if (field.data_type === 'dropdown' || (field.options && field.options.length > 0)) {
            return (
                <div key={field.name} className="flex-1">
                    <label className={labelStyle}>{label}</label>
                    <select
                        name={field.name}
                        value={val}
                        onChange={(e) => onChange(e, index)}
                        className={inputStyle}
                    >
                        <option value="">Select {label}</option>
                        {field.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (field.data_type === 'date') {
            return (
                <div key={field.name} className="flex-1">
                    <label className={labelStyle}>{label}</label>
                    <input
                        type="date"
                        name={field.name}
                        value={val}
                        onChange={(e) => onChange(e, index)}
                        className={inputStyle}
                    />
                </div>
            );
        }

        if (field.data_type === 'number') {
            return (
                <div key={field.name} className="flex-1">
                    <label className={labelStyle}>{label}</label>
                    <input
                        type="number"
                        name={field.name}
                        value={val}
                        onChange={(e) => onChange(e, index)}
                        className={inputStyle}
                    />
                </div>
            );
        }

        if (field.data_type === 'textarea') {
            return (
                <div key={field.name} className={field.data_type === 'textarea' ? "col-span-1 md:col-span-2" : "flex-1"}>
                    <label className={labelStyle}>{label}</label>
                    <textarea
                        name={field.name}
                        value={val}
                        onChange={(e) => onChange(e, index)}
                        className={`${inputStyle} h-24`}
                    />
                </div>
            );
        }

        // Default Text
        return (
            <div key={field.name} className="flex-1">
                <label className={labelStyle}>{label}</label>
                <input
                    type="text"
                    name={field.name}
                    value={val}
                    onChange={(e) => onChange(e, index)}
                    className={inputStyle}
                />
            </div>
        );
    };

    return (
        <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {fields.map((field, i) => renderField(field, i))}
        </div>
    );
};

export default DynamicForm;
