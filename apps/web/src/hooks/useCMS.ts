import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface CMSContent {
    key: string;
    type: 'text' | 'json' | 'image' | 'video';
    value: any;
}

export const useCMS = (key: string) => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('cms_content')
                    .select('value')
                    .eq('key', key)
                    .single();

                if (error) {
                    // If error is code 'PGRST116' (0 rows), we might want to return null silently or handle defaults.
                    // For now, let's just log and set error.
                    if (error.code !== 'PGRST116') {
                        console.error(`Error fetching CMS content for key "${key}":`, error);
                    }
                    throw error;
                }

                if (data) {
                    setContent(data.value);
                }
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [key]);

    return { content, loading, error };
};

export const useCMSBatch = (keys: string[]) => {
    const [contents, setContents] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContents = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('cms_content')
                    .select('key, value')
                    .in('key', keys);

                if (error) throw error;

                if (data) {
                    const contentMap = data.reduce((acc, item) => {
                        acc[item.key] = item.value;
                        return acc;
                    }, {} as Record<string, any>);
                    setContents(contentMap);
                }
            } catch (err) {
                console.error('Error fetching CMS batch:', err);
            } finally {
                setLoading(false);
            }
        };

        if (keys.length > 0) {
            fetchContents();
        }
    }, [JSON.stringify(keys)]); // Simple array dependency check

    return { contents, loading };
};
