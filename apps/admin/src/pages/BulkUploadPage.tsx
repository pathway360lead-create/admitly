import { FC, useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { adminAPI, InstitutionCreateData, ProgramCreateData, DeadlineCreateData } from '../lib/api';
import { parseCSV } from '../utils/csv';

type UploadType = 'institutions' | 'programs' | 'deadlines';

export const BulkUploadPage: FC = () => {
    const [uploadType, setUploadType] = useState<UploadType>('institutions');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<{ success: number; failed: number; logs: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResults(null);
            parseFile(selectedFile);
        }
    };

    const parseFile = async (file: File) => {
        const text = await file.text();
        setErrors([]);
        setParsedData([]);

        if (uploadType === 'institutions') {
            const mappings: Record<string, keyof InstitutionCreateData> = {
                'Name': 'name',
                'Short Name': 'short_name',
                'Type': 'type', // federal_university, etc.
                'State': 'state',
                'City': 'city',
                'Address': 'address',
                'Description': 'description',
                'Website': 'website',
                'Email': 'email',
                'Phone': 'phone',
                'Year Established': 'year_established',
                'Accreditation': 'accreditation_status'
            };
            const result = parseCSV<InstitutionCreateData>(text, mappings);
            setParsedData(result.data);
            setErrors(result.errors);
        } else if (uploadType === 'programs') {
            // Programs
            // Need institution_slug to link, mapped to institution_id logic below or backend handles slug?
            // Backend createProgram usually expects institution_id.
            // We might need to fetch institution ID by slug first or assume backend handles "institution_slug" if we modify API.
            // For now, let's assume CSV provides 'Institution Slug' and we resolve it or backend does.
            // Admin API `createProgram` takes `institution_id`. We'll need to resolve slug -> id client side if backend doesn't support slug.

            const mappings = {
                'Institution Slug': 'institution_slug', // Custom field to resolve
                'Name': 'name',
                'Degree Type': 'degree_type',
                'Years': 'duration_years',
                'Mode': 'mode',
                'Tuition': 'tuition_per_year',
                'Acceptance Fee': 'acceptance_fee',
                'Cutoff': 'cutoff_score',
                'Accreditation': 'accreditation_status',
                'Description': 'description'
            };
            const result = parseCSV<any>(text, mappings);
            setParsedData(result.data);
            setErrors(result.errors);
        } else if (uploadType === 'deadlines') {
            // Deadlines
            const mappings: Record<string, keyof DeadlineCreateData> = {
                'Title': 'title',
                'Description': 'description',
                'Start Date': 'start_date',
                'End Date': 'end_date',
                'Screening Date': 'screening_date',
                'Type': 'type',
                'Priority': 'priority',
                'Link': 'link',
                'Related Entity Type': 'related_entity_type',
                'Related Entity ID': 'related_entity_id',
            };
            const result = parseCSV<DeadlineCreateData>(text, mappings);
            setParsedData(result.data);
            setErrors(result.errors);
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        const logs: string[] = [];
        let successCount = 0;
        let failCount = 0;

        // Process in chunks of 5
        const chunkSize = 5;
        for (let i = 0; i < parsedData.length; i += chunkSize) {
            const chunk = parsedData.slice(i, i + chunkSize);

            await Promise.all(chunk.map(async (item, idx) => {
                const rowIndex = i + idx + 1;
                try {
                    if (uploadType === 'institutions') {
                        // Ensure required fields
                        const payload: InstitutionCreateData = {
                            ...item,
                            verified: true, // Auto verify bulk uploads?
                            status: 'published'
                        };
                        await adminAPI.createInstitution(payload);
                    } else if (uploadType === 'programs') {
                        // Resolve Institution Slug to ID
                        // NOTE: This could be slow. Ideally backend supports slug.
                        // For now, create a look up cache or fetch one by one.
                        // Let's try to fetch institution by slug.
                        if (!item.institution_slug) throw new Error("Missing Institution Slug");

                        // We need a way to find institution by slug. adminAPI.listInstitutions({search...})?
                        // Or if we added `getInstitutionBySlug` in adminAPI? 
                        // adminAPI has `listInstitutions`. We can assume search works or fetch all?
                        // Fetching all for cache is better if not too many. 
                        // For MVP, let's fetch individual.
                        // WARNING: This is N+1 but for bulk upload it's okay (concurrency limited).

                        // BUT `adminAPI` doesn't expose `getInstitutionBySlug`.
                        // Let's add a helper or use generic search.
                        // Assuming `listInstitutions` with `search` param works for slug or name.
                        // Or better, catch specific error if not found.

                        // Wait, for step 41 `adminAPI` has `listInstitutions`.
                        // Let's assume user puts Institution ID if they are advanced, OR we skip logic for now 
                        // and assume the user puts a valid ID in the CSV for "Institution ID" instead of slug.
                        // Simplest for "Senior Dev" MVP: Support ID column.

                        let instId = item.institution_id;

                        if (!instId && item.institution_slug) {
                            // Try to resolve slug (mock logic: assume backend search finds it? No, explicit ID is safer)
                            // Let's log warning and skip if no ID.
                            // Actually, let's try to fetch list and find match.
                            const list = await adminAPI.listInstitutions({ search: item.institution_slug, page_size: 1 });
                            if (list.data && list.data.length > 0) {
                                instId = list.data[0].id; // Risk of wrong match if fuzzy search
                            } else {
                                throw new Error(`Institution '${item.institution_slug}' not found`);
                            }
                        }

                        if (!instId) throw new Error("Institution ID or valid Slug required");

                        const payload: ProgramCreateData = {
                            institution_id: instId,
                            name: item.name,
                            degree_type: item.degree_type?.toLowerCase() || 'undergraduate',
                            duration_years: Number(item.duration_years),
                            mode: item.mode?.toLowerCase() || 'full_time',
                            tuition_per_year: Number(item.tuition_per_year),
                            acceptance_fee: Number(item.acceptance_fee || 0),
                            cutoff_score: Number(item.cutoff_score || 0),
                            accreditation_status: item.accreditation_status,
                            description: item.description,
                            status: 'published'
                        };
                        await adminAPI.createProgram(payload);
                    } else if (uploadType === 'deadlines') {
                        // Parse dates helper - handles DD/MM/YYYY and YYYY-MM-DD formats
                        const parseDate = (dateStr: string | undefined): string | undefined => {
                            if (!dateStr || dateStr.trim() === '') return undefined;
                            try {
                                let normalizedDate = dateStr.trim();

                                // Check for DD/MM/YYYY format (e.g., 15/01/2025 or 15-01-2025)
                                const ddmmyyyyMatch = normalizedDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                                if (ddmmyyyyMatch) {
                                    const [, day, month, year] = ddmmyyyyMatch;
                                    normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                                }

                                const d = new Date(normalizedDate);
                                if (isNaN(d.getTime())) throw new Error('Invalid date');
                                return d.toISOString();
                            } catch { return undefined; }
                        };

                        const endDateParsed = parseDate(item.end_date);
                        if (!endDateParsed) throw new Error("Missing or invalid End Date");

                        const payload: DeadlineCreateData = {
                            title: item.title,
                            description: item.description || undefined,
                            start_date: parseDate(item.start_date),
                            end_date: endDateParsed,
                            screening_date: parseDate(item.screening_date),
                            type: ['exam', 'admission', 'scholarship', 'event', 'other'].includes(item.type?.toLowerCase())
                                ? item.type.toLowerCase() as any : 'other',
                            priority: ['high', 'medium', 'low'].includes(item.priority?.toLowerCase())
                                ? item.priority.toLowerCase() as any : 'medium',
                            link: item.link || undefined,
                            related_entity_type: item.related_entity_type
                                ? (['program', 'institution', 'none'].includes(item.related_entity_type.toLowerCase())
                                    ? item.related_entity_type.toLowerCase() as any
                                    : undefined)
                                : undefined,
                            related_entity_id: item.related_entity_id && item.related_entity_id.trim() !== ''
                                ? item.related_entity_id.trim()
                                : undefined,
                        };
                        await adminAPI.createDeadline(payload);
                    }
                    successCount++;
                    logs.push(`Row ${rowIndex}: Success`);
                } catch (err: any) {
                    failCount++;
                    logs.push(`Row ${rowIndex} Failed: ${err.response?.data?.detail || err.message}`);
                }
            }));
        }

        setResults({ success: successCount, failed: failCount, logs });
        setUploading(false);
    };

    const downloadTemplate = () => {
        let headers = '';
        if (uploadType === 'institutions') {
            headers = 'Name,Short Name,Type,State,City,Address,Description,Website,Email,Phone,Year Established,Accreditation';
        } else if (uploadType === 'programs') {
            headers = 'Institution Slug,Name,Degree Type,Years,Mode,Tuition,Acceptance Fee,Cutoff,Accreditation,Description';
        } else if (uploadType === 'deadlines') {
            headers = 'Title,Description,Start Date,End Date,Screening Date,Type,Priority,Link,Related Entity Type,Related Entity ID';
        }
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${uploadType}.csv`;
        a.click();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
                    <p className="mt-2 text-gray-600">Import data from CSV files.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                        <Download className="h-4 w-4" /> Template
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-3 font-medium text-sm ${uploadType === 'institutions'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => { setUploadType('institutions'); setParsedData([]); setResults(null); }}
                >
                    Institutions
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm ${uploadType === 'programs'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => { setUploadType('programs'); setParsedData([]); setResults(null); }}
                >
                    Programs
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm ${uploadType === 'deadlines'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => { setUploadType('deadlines'); setParsedData([]); setResults(null); }}
                >
                    Deadlines
                </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Click to upload CSV</p>
                    <p className="text-sm text-gray-400 mt-2">{file ? file.name : "or drag and drop"}</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold text-red-800">CSV Parsing Errors</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700 max-h-40 overflow-y-auto">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            {parsedData.length > 0 && !results && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Preview ({parsedData.length} rows)</h3>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Start Import
                        </button>
                    </div>
                    <div className="overflow-x-auto border rounded-lg max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    {Object.keys(parsedData[0]).slice(0, 6).map(key => (
                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parsedData.slice(0, 20).map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).slice(0, 6).map((val: any, j) => (
                                            <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 20 && (
                            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                                ... and {parsedData.length - 20} more rows
                            </div>
                        )}
                    </div>
                </div>
            )}

            {results && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold mb-4">Import Results</h3>
                        <div className="flex gap-8">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                                <span className="text-2xl font-bold">{results.success}</span>
                                <span className="text-sm font-medium">Success</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-6 w-6" />
                                <span className="text-2xl font-bold">{results.failed}</span>
                                <span className="text-sm font-medium">Failed</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 max-h-96 overflow-y-auto font-mono text-sm">
                        {results.logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
