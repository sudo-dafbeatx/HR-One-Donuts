"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { saveBotKnowledge, deleteBotKnowledge, exportBotKnowledge, importBotKnowledge, getBotTrainingData } from "@/app/admin/actions";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  bot_type?: 'dona' | 'onat';
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
  const [activeBot, setActiveBot] = useState<'dona' | 'onat'>('dona');
  
  const [qaList, setQaList] = useState<QAPair[]>([]);
  const [questionLogs, setQuestionLogs] = useState<QuestionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQa, setEditingQa] = useState<QAPair | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general", tags: [] as string[] });
  const [tagInput, setTagInput] = useState("");
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [jsonPasteData, setJsonPasteData] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState<ImportEntry[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { qaList, questionLogs } = await getBotTrainingData(activeBot);
      setQaList(qaList);
      setQuestionLogs(questionLogs);
    } catch (err) {
      console.error("Failed to fetch bot training data", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeBot]);

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
      const payload = { 
        ...formData, 
        bot_type: activeBot,
        ...(editingQa ? { id: editingQa.id } : {}) 
      };
      
      const { success } = await saveBotKnowledge(payload);
      if (success) {
        setStatus({ type: "success", msg: "Data berhasil disimpan" });
        setIsModalOpen(false);
        setEditingQa(null);
        setFormData({ question: "", answer: "", category: "general", tags: [] });
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
      const data = await exportBotKnowledge(activeBot);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bot-${activeBot}-training-${new Date().toISOString().split('T')[0]}.json`;
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
      a.download = "bot-training.schema.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mendownload schema");
    }
  };

  const processImportedJsonText = (jsonText: string) => {
    try {
        const json = JSON.parse(jsonText);
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
        setIsImportModalOpen(false); // Close the paste/upload modal
        setIsPreviewModalOpen(true);  // Open the preview modal
      } catch {
        alert("Gagal membaca JSON. Pastikan format valid dan sesuai struktur.");
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonPasteData(event.target.result as string);
        processImportedJsonText(event.target.result as string);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear input
  };

  const handleJsonSubmit = () => {
    if (!jsonPasteData.trim()) return;
    processImportedJsonText(jsonPasteData);
  };

  const confirmImport = async () => {
    if (importErrors.length > 0) {
      alert("Harap perbaiki error sebelum mengimpor.");
      return;
    }

    try {
      const res = await importBotKnowledge(importedData, activeBot);
      if (res.success) {
        setStatus({ type: "success", msg: `${res.count} data berhasil diimpor ke Bot ${activeBot === 'dona' ? 'Dona' : 'Onat'}` });
        setIsPreviewModalOpen(false);
        setJsonPasteData(""); // clear text
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

  const clearStatus = () => {
    setTimeout(() => setStatus(null), 5000);
  };
  
  useEffect(() => {
     if(status) clearStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="p-6 max-w-6xl mx-auto pb-32">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveBot('dona')}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${
            activeBot === 'dona' 
            ? 'border-primary bg-primary/5 shadow-sm text-primary' 
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className="font-bold text-lg mb-1">Bot Dona</span>
          <span className="text-xs">Penjualan, Menu, Promo, Pesanan</span>
        </button>
        <button
          onClick={() => setActiveBot('onat')}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all ${
            activeBot === 'onat' 
            ? 'border-slate-800 bg-slate-800/5 shadow-sm text-slate-800' 
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span className="font-bold text-lg mb-1">Bot Onat</span>
          <span className="text-xs">Sistem Akun, Login, Error Teknis, Keluhan</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${activeBot === 'dona' ? 'text-primary' : 'text-slate-800'}`}>
            Training Bot {activeBot === 'dona' ? 'Dona' : 'Onat'}
          </h1>
          <p className="text-slate-500 text-sm">Kelola basis pengetahuan (Knowledge Base) mandiri untuk bot ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <DocumentTextIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold">Import Data</span>
          </button>
          
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
            className={`flex items-center gap-2 text-white px-4 py-2 rounded-xl transition-all shadow-lg ${
              activeBot === 'dona' ? 'bg-primary hover:bg-blue-600 shadow-primary/20' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'
            }`}
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
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Knowledge Base</h2>
              <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg">{qaList.length} Entri</span>
            </div>
            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : qaList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <DocumentTextIcon className="w-12 h-12 text-slate-200 mb-2" />
                  <p>Belum ada data Q&A untuk Bot {activeBot === 'dona' ? 'Dona' : 'Onat'}.</p>
                </div>
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
                          className={`p-2 rounded-lg transition-all ${
                            activeBot === 'dona' ? 'text-slate-400 hover:text-primary hover:bg-blue-50' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                          }`}
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
                Pertanyaan User (Global)
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
                          className={`text-[10px] font-bold hover:underline ${
                            activeBot === 'dona' ? 'text-primary' : 'text-slate-800'
                          }`}
                        >
                          Beri Jawaban ({activeBot === 'dona' ? 'Dona' : 'Onat'})
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

      {/* Manual Input Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingQa ? "Edit Knowledge" : "Tambah Knowledge"}
                <span className={`block mt-1 text-sm ${activeBot === 'dona' ? 'text-primary' : 'text-slate-600'}`}>
                  Untuk Bot {activeBot === 'dona' ? 'Dona' : 'Onat'}
                </span>
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
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Jawaban (Bot {activeBot === 'dona' ? 'Dona' : 'Onat'})</label>
                <textarea 
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Mis: Tentu saja! Kami melayani pesanan 24 jam..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none"
                  required
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none"
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
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none text-sm"
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
                  className={`flex-1 px-4 py-2 text-white rounded-xl font-bold shadow-lg transition-colors ${
                    activeBot === 'dona' ? 'bg-primary hover:bg-blue-600 shadow-primary/20' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'
                  }`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal Input (Paste vs File) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Import Data Training - Bot {activeBot === 'dona' ? 'Dona' : 'Onat'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Masukkan data JSON secara manual atau unggah file.
                </p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Paste JSON Langsung Disini</label>
                  <textarea 
                    value={jsonPasteData}
                    onChange={(e) => setJsonPasteData(e.target.value)}
                    placeholder={'[\n  {\n    "question": "Apakah buka tiap hari?",\n    "answer": "Kami buka setiap hari!",\n    "category": "general",\n    "tags": ["jam buka", "waktu"]\n  }\n]'}
                    className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none font-mono text-xs bg-slate-50 text-slate-800"
                  />
               </div>
               
               <div className="flex items-center gap-4 my-2">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
               </div>

               <div>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ArrowDownTrayIcon className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Klik untuk upload file <span className="text-blue-600">.json</span></p>
                  </div>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
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
                onClick={handleJsonSubmit}
                disabled={!jsonPasteData.trim()}
                className={`flex items-center justify-center px-4 py-2.5 text-white rounded-2xl font-bold shadow-lg transition-all text-sm ${
                    activeBot === 'dona' ? 'bg-primary hover:bg-blue-600 shadow-primary/20' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'
                  } disabled:opacity-50 disabled:shadow-none`}
              >
                Validasi & Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Preview Import JSON</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Data ini akan diimpor ke basis pengetahuan **Bot {activeBot === 'dona' ? 'Dona' : 'Onat'}**.
                </p>
              </div>
              <button onClick={() => { setIsPreviewModalOpen(false); setIsImportModalOpen(true); }} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <h4 className="text-red-700 font-bold text-sm mb-2 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    Error ditemukan:
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

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
               <button 
                  onClick={() => { setIsPreviewModalOpen(false); setIsImportModalOpen(true); }}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-2xl hover:bg-white font-bold transition-all text-sm"
               >
                 Kembali Edit
               </button>
              <button 
                onClick={confirmImport}
                disabled={importErrors.length > 0}
                className={`px-6 py-2.5 text-white rounded-2xl font-bold shadow-lg transition-all text-sm ${
                    activeBot === 'dona' ? 'bg-primary hover:bg-blue-600 shadow-primary/20' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-800/20'
                  } disabled:opacity-50 disabled:shadow-none`}
              >
                Konfirmasi Impor ke Onat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
