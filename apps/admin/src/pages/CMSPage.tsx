import { FC, useEffect, useState } from 'react';
import { supabase } from '../lib/api';
import { Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface CMSItem {
    key: string;
    type: string;
    value: any;
    description: string;
}

export const CMSPage: FC = () => {
    const [items, setItems] = useState<CMSItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cms_content')
                .select('*')
                .order('key');

            if (error) throw error;
            setItems(data || []);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (key: string, newValue: any) => {
        setItems(items.map(item =>
            item.key === key ? { ...item, value: newValue } : item
        ));
    };

    const saveContent = async (key: string) => {
        try {
            setSaving(true);
            setMessage(null);
            const item = items.find(i => i.key === key);
            if (!item) return;

            const { error } = await supabase
                .from('cms_content')
                .update({ value: item.value, updated_at: new Date() })
                .eq('key', key);

            if (error) throw error;
            setMessage({ type: 'success', text: `Saved ${key} successfully` });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderEditor = (item: CMSItem) => {
        if (item.key === 'home_hero') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title (HTML allowed)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            value={item.value.title || ''}
                            onChange={(e) => handleUpdate(item.key, { ...item.value, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            rows={3}
                            value={item.value.subtitle || ''}
                            onChange={(e) => handleUpdate(item.key, { ...item.value, subtitle: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Badge Text</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                value={item.value.badge || ''}
                                onChange={(e) => handleUpdate(item.key, { ...item.value, badge: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CTA Primary</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                value={item.value.cta_primary || ''}
                                onChange={(e) => handleUpdate(item.key, { ...item.value, cta_primary: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CTA Secondary</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                value={item.value.cta_secondary || ''}
                                onChange={(e) => handleUpdate(item.key, { ...item.value, cta_secondary: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (item.key === 'home_stats') {
            return (
                <div className="space-y-4">
                    {item.value.map((stat: any, index: number) => (
                        <div key={index} className="flex gap-4 items-end border p-4 rounded-lg bg-gray-50">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Label</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                    value={stat.label}
                                    onChange={(e) => {
                                        const newStats = [...item.value];
                                        newStats[index].label = e.target.value;
                                        handleUpdate(item.key, newStats);
                                    }}
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-700">Value</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                    value={stat.value}
                                    onChange={(e) => {
                                        const newStats = [...item.value];
                                        newStats[index].value = Number(e.target.value);
                                        handleUpdate(item.key, newStats);
                                    }}
                                />
                            </div>
                            <div className="w-20">
                                <label className="block text-sm font-medium text-gray-700">Suffix</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                    value={stat.suffix || ''}
                                    onChange={(e) => {
                                        const newStats = [...item.value];
                                        newStats[index].suffix = e.target.value;
                                        handleUpdate(item.key, newStats);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Fallback JSON editor
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700">Raw JSON</label>
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border font-mono"
                    rows={5}
                    value={JSON.stringify(item.value, null, 2)}
                    onChange={(e) => {
                        try {
                            handleUpdate(item.key, JSON.parse(e.target.value));
                        } catch (err) {
                            // ignore parse errors while typing
                            console.warn("Invalid JSON");
                        }
                    }}
                />
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                <p className="mt-2 text-gray-600">Manage homepage text and dynamic content.</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="space-y-8">
                {items.map((item) => (
                    <div key={item.key} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 capitalize">{item.key.replace('_', ' ')}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <button
                                onClick={() => saveContent(item.key)}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                title='Save Changes'
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save
                            </button>
                        </div>

                        <div className="border-t pt-4">
                            {renderEditor(item)}
                        </div>
                    </div>
                ))}

                {items.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                        No content items found. Please run the migration to seed data.
                    </div>
                )}
            </div>
        </div>
    );
};
