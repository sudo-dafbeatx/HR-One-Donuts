"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import { saveBotKnowledge, deleteBotKnowledge, exportBotKnowledge, importBotKnowledge, getBotTrainingData } from "@/app/admin/actions";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  created_at: string;
}

interface QuestionLog {
  id: string;
  question: string;
  created_at: string;
  is_answered: boolean;
}

interface ImportEntry {
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export default function BotTrainingPage() {
  const [qaList, setQaList] = useState<QAPair[]>([]);
  const [questionLogs, setQuestionLogs] = useState<QuestionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQa, setEditingQa] = useState<QAPair | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general", tags: [] as string[] });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState<ImportEntry[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const { qaList, questionLogs } = await getBotTrainingData();
      setQaList(qaList);
      setQuestionLogs(questionLogs);
    } catch (err) {
      console.error("Failed to fetch bot training data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    try {
      const { success } = await saveBotKnowledge(editingQa ? { ...formData, id: editingQa.id } : formData);
      if (success) {
        setStatus({ type: "success", msg: "Data berhasil disimpan" });
        setIsModalOpen(false);
        setEditingQa(null);
        setFormData({ question: "", answer: "", category: "general", tags: [] });
        setIsLoading(true);
        fetchData();
      } else {
        setStatus({ type: "error", msg: "Gagal menyimpan data" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Gagal menyimpan data" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus Q&A ini?")) return;
    try {
      const { success } = await deleteBotKnowledge(id);
      if (success) {
        setIsLoading(true);
        fetchData();
      } else {
        setStatus({ type: "error", msg: "Gagal menghapus" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Gagal menghapus" });
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportBotKnowledge();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bot-dona-training-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor data");
    }
  };

  const handleDownloadSchema = async () => {
    try {
      const response = await fetch('/schemas/bot-dona-training.schema.json');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bot-dona-training.schema.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mendownload schema");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          alert("Data JSON harus berupa array.");
          return;
        }

        // Validate preview
        const CATEGORIES = ["general", "ordering", "products", "delivery", "payment", "other"];
        const errors: string[] = [];
        json.forEach((entry, idx) => {
           if (!entry.question || entry.question.length < 5) errors.push(`Entry #${idx+1}: Question minimal 5 karakter.`);
           if (!entry.answer || entry.answer.length < 5) errors.push(`Entry #${idx+1}: Answer minimal 5 karakter.`);
           if (entry.category && !CATEGORIES.includes(entry.category)) errors.push(`Entry #${idx+1}: Kategori tidak valid.`);
        });

        setImportedData(json);
        setImportErrors(errors);
        setIsPreviewModalOpen(true);
      } catch {
        alert("Gagal membaca file JSON. Pastikan format benar.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear input
  };

  const confirmImport = async () => {
    if (importErrors.length > 0) {
      alert("Harap perbaiki error sebelum mengimpor.");
      return;
    }

    try {
      const res = await importBotKnowledge(importedData);
      if (res.success) {
        setStatus({ type: "success", msg: `${res.count} data berhasil diimpor` });
        setIsPreviewModalOpen(false);
        setIsLoading(true);
        fetchData();
      } else if (res.errors) {
        setImportErrors(res.errors);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Gagal mengimpor data" });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleUseFromLog = (question: string) => {
    setFormData({ ...formData, question, tags: [] });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Training Bot Dona
          </h1>
          <p className="text-slate-500 text-sm">Kelola basis pengetahuan AI assistant Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <ArrowUpTrayIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold">Import JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowDownTrayIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold">Export JSON</span>
          </button>
          <button
            onClick={() => {
              setEditingQa(null);
              setFormData({ question: "", answer: "", category: "general", tags: [] });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Q&A
          </button>
        </div>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-in ${
          status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {status.type === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Q&A List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Knowledge Base</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : qaList.length === 0 ? (
                <div className="p-12 text-center text-slate-400">Belum ada data Q&A.</div>
              ) : (
                qaList.map((qa) => (
                  <div key={qa.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
                            {qa.category}
                          </span>
                          {qa.tags?.map(tag => (
                            <span key={tag} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">Q: {qa.question}</h4>
                        <p className="text-slate-600 text-sm italic">A: {qa.answer}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingQa(qa);
                            setFormData({ question: qa.question, answer: qa.answer, category: qa.category, tags: qa.tags || [] });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(qa.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Logs Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                Pertanyaan User
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {questionLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">Log kosong</div>
              ) : (
                questionLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-medium text-slate-800 mb-1">{log.question}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                      {!log.is_answered && (
                        <button 
                          onClick={() => handleUseFromLog(log.question)}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Beri Jawaban
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingQa ? "Edit Knowledge" : "Tambah Knowledge"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pertanyaan (User)</label>
                <input 
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Mis: Apakah bisa pesan 24 jam?"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Jawaban (Bot)</label>
                <textarea 
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Mis: Tentu saja! Kami melayani pesanan 24 jam..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="general">Umum</option>
                  <option value="ordering">Cara Pesan</option>
                  <option value="products">Produk</option>
                  <option value="delivery">Pengiriman</option>
                  <option value="payment">Pembayaran</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tags (Keywords)</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                   {formData.tags.map(tag => (
                     <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
                       {tag}
                       <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                         <XMarkIcon className="w-3 h-3" />
                       </button>
                     </span>
                   ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Tambah tag..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm"
                  />
                  <button 
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold text-sm"
                  >
                    Tambah
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 font-bold shadow-lg shadow-primary/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Preview Import JSON</h3>
                <p className="text-slate-500 text-xs">Periksa data sebelum disimpan ke database</p>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <h4 className="text-red-700 font-bold text-sm mb-2 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    Banyak Error ditemukan:
                  </h4>
                  <ul className="text-red-600 text-[11px] list-disc pl-4 space-y-1">
                    {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="space-y-3">
                {importedData.map((entry, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                        {entry.category || 'general'}
                      </span>
                      {Array.isArray(entry.tags) && entry.tags.map((t: string) => <span key={t} className="text-slate-400">#{t}</span>)}
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">Q: {entry.question}</p>
                    <p className="text-xs text-slate-600 italic">A: {entry.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4 bg-slate-50/30">
              <button 
                 onClick={handleDownloadSchema}
                 className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-2xl hover:bg-white font-bold transition-all text-sm"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Download Schema
              </button>
              <button 
                onClick={confirmImport}
                disabled={importErrors.length > 0}
                className="px-4 py-2.5 bg-primary text-white rounded-2xl hover:bg-blue-600 font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all text-sm"
              >
                Impor Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
