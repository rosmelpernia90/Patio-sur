import { useState, useRef, useCallback, useEffect } from 'react';
import Groq from 'groq-sdk';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import {
  Bot, Upload, FileText, FileSpreadsheet, File, Send,
  Key, Eye, EyeOff, Sparkles, MessageSquare, Trash2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import clsx from 'clsx';

// Set pdfjs worker via CDN to avoid Vite bundler complexity
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ── Types ────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UploadedFile {
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'text' | 'unknown';
  size: number;
  textContent: string;   // extracted text for all types
  displayContent: string; // preview snippet
}

// ── Model options ─────────────────────────────────────────────
interface GroqModel {
  id: string;
  label: string;
  description: string;
}

const GROQ_MODELS: GroqModel[] = [
  { id: 'llama-3.3-70b-versatile',  label: 'Llama 3.3 70B',   description: 'Más capaz · Recomendado' },
  { id: 'llama-3.1-8b-instant',     label: 'Llama 3.1 8B',    description: 'Rápido · Ligero' },
  { id: 'mixtral-8x7b-32768',       label: 'Mixtral 8×7B',    description: 'Contexto amplio · 32K' },
];

// ── Helpers ──────────────────────────────────────────────────
const LS_KEY       = 'pcm_groq_key';
const LS_MODEL_KEY = 'pcm_groq_model';

function getFileIcon(type: UploadedFile['type']) {
  if (type === 'pdf')   return <FileText       className="h-5 w-5 text-red-500" />;
  if (type === 'excel') return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
  if (type === 'word')  return <FileText        className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-steel-400" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── PDF text extraction via pdfjs-dist ───────────────────────
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text    = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(`--- Página ${i} ---\n${text}`);
  }
  return pages.join('\n\n');
}

// ── File processor ────────────────────────────────────────────
async function extractFileContent(file: File): Promise<UploadedFile> {
  const name = file.name;
  const ext  = name.split('.').pop()?.toLowerCase() ?? '';

  // ── PDF ──────────────────────────────────────────────────
  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer();
    const text   = await extractPdfText(buffer);
    return {
      name,
      type: 'pdf',
      size: file.size,
      textContent: text,
      displayContent: text.slice(0, 800) + (text.length > 800 ? '\n...' : ''),
    };
  }

  // ── Excel ────────────────────────────────────────────────
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    const buffer = await file.arrayBuffer();
    const wb     = XLSX.read(buffer, { type: 'array' });
    const sheets = wb.SheetNames.map((sheetName) => {
      const ws  = wb.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false });
      return `=== HOJA: ${sheetName} ===\n${csv}`;
    }).join('\n\n');
    return {
      name,
      type: 'excel',
      size: file.size,
      textContent: sheets,
      displayContent: sheets.slice(0, 800) + (sheets.length > 800 ? '\n...' : ''),
    };
  }

  // ── Word ─────────────────────────────────────────────────
  if (['docx', 'doc'].includes(ext)) {
    const buffer  = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    const result  = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text    = result.value;
    return {
      name,
      type: 'word',
      size: file.size,
      textContent: text,
      displayContent: text.slice(0, 800) + (text.length > 800 ? '\n...' : ''),
    };
  }

  // ── Plain text ───────────────────────────────────────────
  if (['txt', 'md', 'json', 'xml'].includes(ext)) {
    const text = await file.text();
    return {
      name,
      type: 'text',
      size: file.size,
      textContent: text,
      displayContent: text.slice(0, 800) + (text.length > 800 ? '\n...' : ''),
    };
  }

  return {
    name,
    type: 'unknown',
    size: file.size,
    textContent: '',
    displayContent: 'Tipo de archivo no soportado.',
  };
}

// ── Build Groq messages ───────────────────────────────────────
function buildGroqMessages(
  uploadedFile: UploadedFile,
  history: ChatMessage[],
): Groq.Chat.ChatCompletionMessageParam[] {
  const docContext = `DOCUMENTO: "${uploadedFile.name}"\n\n${uploadedFile.textContent}`;

  return history.map((msg, idx) => {
    if (idx === 0 && msg.role === 'user') {
      return {
        role: 'user' as const,
        content: `${docContext}\n\n---\n\n${msg.content}`,
      };
    }
    return { role: msg.role as 'user' | 'assistant', content: msg.content };
  });
}

// ── Component ────────────────────────────────────────────────
export default function AIAnalyzerPage() {
  // API key
  const [apiKey,   setApiKey]   = useState(() => localStorage.getItem(LS_KEY) ?? '');
  const [showKey,  setShowKey]  = useState(false);
  const [keySaved, setKeySaved] = useState(() => !!localStorage.getItem(LS_KEY));

  // Model selector
  const [selectedModel,   setSelectedModel]   = useState(
    () => localStorage.getItem(LS_MODEL_KEY) ?? GROQ_MODELS[0].id,
  );
  const [showModelMenu, setShowModelMenu] = useState(false);

  // File
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [fileLoading,  setFileLoading]  = useState(false);
  const [fileError,    setFileError]    = useState<string | null>(null);

  // Chat
  const [history,    setHistory]    = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState('');
  const [streaming,  setStreaming]  = useState(false);
  const [streamText, setStreamText] = useState('');

  // UI
  const [showPreview, setShowPreview] = useState(false);
  const chatEndRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, streamText]);

  // ── API Key ───────────────────────────────────────────────
  const saveKey = () => {
    localStorage.setItem(LS_KEY, apiKey.trim());
    setKeySaved(true);
  };
  const clearKey = () => {
    localStorage.removeItem(LS_KEY);
    setApiKey('');
    setKeySaved(false);
  };

  // ── Model select ──────────────────────────────────────────
  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(LS_MODEL_KEY, modelId);
    setShowModelMenu(false);
  };

  const currentModel = GROQ_MODELS.find((m) => m.id === selectedModel) ?? GROQ_MODELS[0];

  // ── File handling ─────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setFileLoading(true);
    setFileError(null);
    setUploadedFile(null);
    setHistory([]);

    try {
      const result = await extractFileContent(file);
      if (result.type === 'unknown')
        throw new Error('Tipo de archivo no soportado. Usa PDF, Excel, Word o texto plano.');
      setUploadedFile(result);
    } catch (e: unknown) {
      setFileError(e instanceof Error ? e.message : 'Error al procesar el archivo.');
    } finally {
      setFileLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); handleFiles(e.dataTransfer.files); },
    [handleFiles],
  );

  // ── Send message to Groq ──────────────────────────────────
  const sendMessage = useCallback(async (userText: string) => {
    if (!uploadedFile || !userText.trim() || streaming) return;

    const key = localStorage.getItem(LS_KEY);
    if (!key) { setFileError('Introduce tu API Key de Groq primero.'); return; }

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userText.trim() }];
    setHistory(newHistory);
    setInput('');
    setStreaming(true);
    setStreamText('');

    try {
      const groq = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });

      const stream = await groq.chat.completions.create({
        model:      selectedModel,
        max_tokens: 4096,
        stream:     true,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente experto en análisis de documentos para proyectos de infraestructura eléctrica y gestión de proyectos de ingeniería. ' +
              'Responde siempre en español. Sé preciso, conciso y enfocado en los datos relevantes del documento. ' +
              'Si el documento contiene datos financieros o numéricos, cítalos exactamente.',
          },
          ...buildGroqMessages(uploadedFile, newHistory),
        ],
      });

      let fullText = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          fullText += delta;
          setStreamText(fullText);
        }
      }

      setHistory((prev) => [...prev, { role: 'assistant', content: fullText }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al conectar con Groq.';
      setHistory((prev) => [...prev, { role: 'assistant', content: `❌ Error: ${msg}` }]);
    } finally {
      setStreaming(false);
      setStreamText('');
    }
  }, [uploadedFile, history, streaming, selectedModel]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  // ── Quick prompts ─────────────────────────────────────────
  const quickPrompts = [
    { label: 'Resumen ejecutivo',  prompt: 'Genera un resumen ejecutivo del documento destacando los puntos más importantes.' },
    { label: 'Datos financieros',  prompt: 'Extrae y lista todos los valores financieros, montos y cifras importantes que aparecen en el documento.' },
    { label: 'Riesgos',            prompt: '¿Cuáles son los principales riesgos o alertas mencionados en el documento?' },
    { label: 'Fechas clave',       prompt: 'Lista todas las fechas y plazos importantes mencionados en el documento.' },
    { label: 'Conclusiones',       prompt: 'Enumera las conclusiones o recomendaciones más importantes del documento.' },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary-600" />
            Analizador IA — Documentos
          </h2>
          <p className="text-xs text-steel-400 mt-1">
            Sube un archivo PDF, Excel o Word y conversa con la IA sobre su contenido
          </p>
        </div>

        {/* Model badge / selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full hover:bg-primary-100 transition"
          >
            <Sparkles className="h-3 w-3" />
            {currentModel.label}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showModelMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowModelMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-xl border border-steel-200 bg-white shadow-lg py-2">
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-steel-400">
                  Modelo Groq
                </p>
                {GROQ_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectModel(m.id)}
                    className={clsx(
                      'w-full text-left px-4 py-2.5 hover:bg-steel-50 transition',
                      m.id === selectedModel && 'bg-primary-50',
                    )}
                  >
                    <p className={clsx('text-xs font-semibold', m.id === selectedModel ? 'text-primary-700' : 'text-steel-800')}>
                      {m.label}
                    </p>
                    <p className="text-[10px] text-steel-400">{m.description}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── API Key Section ── */}
      <div className={clsx(
        'rounded-xl border p-4',
        keySaved ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50',
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Key className={clsx('h-4 w-4', keySaved ? 'text-emerald-600' : 'text-amber-600')} />
          <p className={clsx('text-xs font-semibold', keySaved ? 'text-emerald-700' : 'text-amber-700')}>
            {keySaved ? 'API Key de Groq configurada ✓' : 'Configura tu API Key de Groq'}
          </p>
          {keySaved && (
            <button
              onClick={clearKey}
              className="ml-auto text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Eliminar
            </button>
          )}
        </div>

        {!keySaved && (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-mono pr-9 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-steel-400"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={saveKey}
                disabled={!apiKey.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40 transition"
              >
                Guardar
              </button>
            </div>
            <p className="text-[10px] text-amber-600 mt-2">
              Obtén tu API Key gratis en{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                console.groq.com/keys
              </a>
              . Se guarda localmente solo en este navegador.
            </p>
          </>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: File Upload ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'rounded-xl border-2 border-dashed cursor-pointer transition-all p-6 text-center',
              uploadedFile
                ? 'border-primary-300 bg-primary-50'
                : 'border-steel-300 bg-steel-50 hover:border-primary-400 hover:bg-primary-50',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt,.md"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {fileLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                <p className="text-xs text-steel-500">Procesando archivo...</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                {getFileIcon(uploadedFile.type)}
                <p className="text-xs font-semibold text-steel-800 break-all">{uploadedFile.name}</p>
                <p className="text-[10px] text-steel-400">{formatSize(uploadedFile.size)}</p>
                <p className="text-[10px] text-primary-600 font-medium">Click para cambiar archivo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-steel-300" />
                <div>
                  <p className="text-sm font-semibold text-steel-600">Arrastra tu archivo aquí</p>
                  <p className="text-xs text-steel-400 mt-1">o haz click para seleccionar</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['PDF', 'Excel', 'Word', 'TXT'].map((t) => (
                    <span key={t} className="text-[10px] bg-white border border-steel-200 rounded px-2 py-0.5 text-steel-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {fileError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{fileError}</p>
            </div>
          )}

          {/* Content preview */}
          {uploadedFile && (
            <div className="rounded-xl border border-steel-200 bg-white overflow-hidden">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-steel-600 hover:bg-steel-50 transition"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Vista previa del contenido extraído
                </span>
                {showPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showPreview && (
                <div className="px-4 pb-4">
                  <pre className="text-[10px] text-steel-600 font-mono whitespace-pre-wrap bg-steel-50 rounded p-3 max-h-48 overflow-y-auto scrollbar-pcm">
                    {uploadedFile.displayContent}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Quick prompts */}
          {uploadedFile && history.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide">Preguntas rápidas</p>
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  disabled={streaming || !keySaved}
                  className="w-full text-left rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs text-primary-700 hover:bg-primary-100 transition disabled:opacity-40"
                >
                  <span className="font-semibold">{qp.label}</span>
                  <span className="text-primary-500 ml-1">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Chat ── */}
        <div className="lg:col-span-3 flex flex-col min-h-[500px]">
          <div className="flex-1 rounded-xl border border-steel-200 bg-white flex flex-col overflow-hidden">

            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-steel-100 bg-steel-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary-600" />
                <span className="text-xs font-semibold text-steel-700">Conversación con el documento</span>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] text-steel-400 hover:text-red-500 flex items-center gap-1 transition"
                >
                  <Trash2 className="h-3 w-3" /> Limpiar
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-pcm p-4 space-y-4">

              {!uploadedFile && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Bot className="h-12 w-12 text-steel-200 mb-3" />
                  <p className="text-sm text-steel-400 font-medium">Sube un documento para comenzar</p>
                  <p className="text-xs text-steel-300 mt-1">PDF, Excel, Word o texto plano</p>
                </div>
              )}

              {uploadedFile && history.length === 0 && !streaming && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-steel-600">
                    "{uploadedFile.name}" listo
                  </p>
                  <p className="text-xs text-steel-400 mt-1">
                    Escribe una pregunta o usa las sugerencias de la izquierda
                  </p>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <div className={clsx(
                    'rounded-xl px-4 py-3 max-w-[85%] text-xs leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-steel-50 border border-steel-200 text-steel-800 rounded-tl-none',
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 flex-shrink-0 mt-1">
                      <span className="text-[10px] font-bold text-white">Tú</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response */}
              {streaming && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="rounded-xl rounded-tl-none px-4 py-3 max-w-[85%] bg-steel-50 border border-steel-200">
                    {streamText ? (
                      <p className="text-xs text-steel-800 whitespace-pre-wrap leading-relaxed">
                        {streamText}
                        <span className="inline-block w-1.5 h-3 bg-primary-500 ml-0.5 animate-pulse rounded-sm" />
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 text-primary-500 animate-spin" />
                        <span className="text-xs text-steel-400">Groq está analizando...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-steel-100 p-3">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    !uploadedFile ? 'Sube un documento primero...' :
                    !keySaved     ? 'Configura tu API Key de Groq primero...' :
                    streaming     ? 'Groq está respondiendo...' :
                    'Escribe una pregunta sobre el documento...'
                  }
                  disabled={!uploadedFile || !keySaved || streaming}
                  className="flex-1 rounded-lg border border-steel-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:bg-steel-50 disabled:text-steel-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || !uploadedFile || !keySaved || streaming}
                  className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition flex-shrink-0"
                >
                  {streaming
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                </button>
              </form>
              <p className="text-[9px] text-steel-300 mt-1.5 text-center">
                El contenido del documento se envía a Groq ({currentModel.label}) para su análisis. Usa solo documentos internos.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
