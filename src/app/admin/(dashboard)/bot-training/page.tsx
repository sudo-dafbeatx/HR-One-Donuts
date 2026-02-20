"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
}

interface QuestionLog {
  id: string;
  question: string;
  created_at: string;
  is_answered: boolean;
}

export default function BotTrainingPage() {
  const [qaList, setQaList] = useState<QAPair[]>([]);
  const [questionLogs, setQuestionLogs] = useState<QuestionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQa, setEditingQa] = useState<QAPair | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", category: "general" });
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { data: qa, error: qaErr } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: logs, error: logsErr } = await supabase
      .from("bot_questions_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!qaErr) setQaList(qa || []);
    if (!logsErr) setQuestionLogs(logs || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    const op = editingQa 
      ? supabase.from("knowledge_base").update(formData).eq("id", editingQa.id)
      : supabase.from("knowledge_base").insert([formData]);

    const { error } = await op;

    if (error) {
      setStatus({ type: "error", msg: "Gagal menyimpan data" });
    } else {
      setStatus({ type: "success", msg: "Data berhasil disimpan" });
      setIsModalOpen(false);
      setEditingQa(null);
      setFormData({ question: "", answer: "", category: "general" });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus Q&A ini?")) return;
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) setStatus({ type: "error", msg: "Gagal menghapus" });
    else fetchData();
  };

  const handleUseFromLog = (question: string) => {
    setFormData({ ...formData, question });
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
        <button
          onClick={() => {
            setEditingQa(null);
            setFormData({ question: "", answer: "", category: "general" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Q&A
        </button>
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
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider mb-2">
                          {qa.category}
                        </span>
                        <h4 className="font-bold text-slate-900 mb-1">Q: {qa.question}</h4>
                        <p className="text-slate-600 text-sm">A: {qa.answer}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingQa(qa);
                            setFormData({ question: qa.question, answer: qa.answer, category: qa.category });
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
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
                </select>
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
    </div>
  );
}
