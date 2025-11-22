// src/components/EmployeeDocumentsModal.tsx
// ----------------------------------------
// Modal สำหรับจัดการเอกสารของพนักงานคนหนึ่ง
// มี DocumentFormModal อยู่ในไฟล์นี้เลย
// ----------------------------------------

import React, { useEffect, useState } from "react";
import {
  Document,
  Employee,
  DOCUMENT_TYPES,
  supabase,
} from "../supabase";

// -----------------------------
// DocumentFormModal
// -----------------------------

interface DocumentFormModalProps {
  document: Document | null; // null = add, not null = edit
  onClose: () => void;
  onSave: (form: Omit<Document, "employee_id" | "id" | "created_at">) => void;
}

const emptyDoc: Omit<Document, "employee_id" | "id" | "created_at"> = {
  doc_type: DOCUMENT_TYPES[0],
  doc_number: 1,
  sender: "",
  receiver: "",
  date_filled: "",
  date_sent: "",
  status: "active",
};

function DocumentFormModal({
  document,
  onClose,
  onSave,
}: DocumentFormModalProps) {
  const isEdit = !!document;

  const [form, setForm] = useState<
    Omit<Document, "employee_id" | "id" | "created_at">
  >(document ? {
      doc_type: document.doc_type,
      doc_number: document.doc_number,
      sender: document.sender,
      receiver: document.receiver,
      date_filled: document.date_filled,
      date_sent: document.date_sent,
      status: document.status,
    } : emptyDoc);

  // ถ้าเปลี่ยน document (จาก add → edit หรือสลับเอกสาร) ให้ reset form
  useEffect(() => {
    if (document) {
      setForm({
        doc_type: document.doc_type,
        doc_number: document.doc_number,
        sender: document.sender,
        receiver: document.receiver,
        date_filled: document.date_filled,
        date_sent: document.date_sent,
        status: document.status,
      });
    } else {
      setForm(emptyDoc);
    }
  }, [document]);

  const update = (k: keyof typeof form, v: any) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Document" : "Add Document"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              ประเภทเอกสาร
            </label>
            <select
              className="w-full border rounded p-2"
              value={form.doc_type}
              onChange={(e) => update("doc_type", e.target.value)}
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              เลขที่เอกสาร
            </label>
            <input
              className="w-full border rounded p-2"
              type="number"
              value={form.doc_number}
              onChange={(e) =>
                update("doc_number", Number(e.target.value) || 0)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                ผู้ส่ง (Sender)
              </label>
              <input
                className="w-full border rounded p-2"
                placeholder="Sender"
                value={form.sender}
                onChange={(e) => update("sender", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                ผู้รับ (Receiver)
              </label>
              <input
                className="w-full border rounded p-2"
                placeholder="Receiver"
                value={form.receiver}
                onChange={(e) => update("receiver", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                วันที่กรอก (Filled)
              </label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={form.date_filled}
                onChange={(e) => update("date_filled", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                วันที่ส่ง (Sent)
              </label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={form.date_sent}
                onChange={(e) => update("date_sent", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              สถานะ (Status)
            </label>
            <select
              className="w-full border rounded p-2"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// EmployeeDocumentsModal (ตัว main)
// -----------------------------

interface EmployeeDocumentsModalProps {
  employee: Employee;
  onClose: () => void;
}

function EmployeeDocumentsModal({
  employee,
  onClose,
}: EmployeeDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [saving, setSaving] = useState(false);

  const sortDocs = (docs: Document[]) =>
    [...docs].sort((a, b) => a.doc_number - b.doc_number);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("employee_id", employee.employee_id);

    setDocuments(sortDocs(data || []));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.employee_id]);

  const handleAddClick = () => {
    setEditingDoc(null);
    setShowForm(true);
  };

  const handleEditClick = (doc: Document) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("ลบเอกสารนี้หรือไม่?");
    if (!ok) return;

    await supabase.from("documents").delete().eq("id", id);
    await load();
  };

  const handleSaveDoc = async (
    form: Omit<Document, "employee_id" | "id" | "created_at">
  ) => {
    setSaving(true);

    if (editingDoc?.id) {
      await supabase
        .from("documents")
        .update({
          ...editingDoc,
          ...form,
        })
        .eq("id", editingDoc.id);
    } else {
      await supabase.from("documents").insert({
        ...form,
        employee_id: employee.employee_id,
      });
    }

    setSaving(false);
    setShowForm(false);
    setEditingDoc(null);
    await load();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{employee.name}</h1>
            <p className="text-gray-600 text-sm">
              ID: {employee.employee_id} | Division: {employee.division}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Employee Status: {employee.status}
            </p>
          </div>
          <button
            className="text-gray-600 hover:text-black text-xl leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">
            Documents{" "}
            <span className="text-sm text-gray-500">
              ({documents.length} records)
            </span>
          </h2>

          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-gray-500">Saving...</span>
            )}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={handleAddClick}
            >
              + Add Document
            </button>
          </div>
        </div>

        {/* Documents list */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {loading ? (
            <p className="text-center py-6 text-gray-500">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              No documents for this employee.
            </p>
          ) : (
            documents.map((d) => (
              <div
                key={d.id}
                className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-base">{d.doc_type}</p>
                    <p className="text-gray-600">
                      <span className="font-medium">Doc No: </span>
                      {d.doc_number}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Sender:</span> {d.sender}{" "}
                      | <span className="font-medium">Receiver:</span>{" "}
                      {d.receiver}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Filled:</span>{" "}
                      {d.date_filled || "-"} |{" "}
                      <span className="font-medium">Sent:</span>{" "}
                      {d.date_sent || "-"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={
                          d.status === "active"
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {d.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm min-w-[80px] items-end">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEditClick(d)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => d.id && handleDelete(d.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal ฟอร์ม */}
        {showForm && (
          <DocumentFormModal
            document={editingDoc}
            onClose={() => {
              setShowForm(false);
              setEditingDoc(null);
            }}
            onSave={handleSaveDoc}
          />
        )}
      </div>
    </div>
  );
}

// default export (สำคัญมาก สำหรับ error ที่เจ๊เจอ)
export default EmployeeDocumentsModal;
