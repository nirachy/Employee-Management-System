import { useState, useEffect } from 'react';
import {
  supabase,
  Document,
  Employee,
  DOCUMENT_TYPES,
  SENDERS,
  RECEIVERS,
} from '../lib/supabase';
import { X, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

interface EmployeeDocumentsModalProps {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeDocumentsModal({
  employee,
  onClose,
}: EmployeeDocumentsModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doc_type: DOCUMENT_TYPES[0],
    doc_number: 1,
    sender: '',
    receiver: '',
    date_filled: '',
    date_sent: '',
    status: 'active',
  });

  useEffect(() => {
    fetchEmployeeDocuments();
  }, [employee.employee_id]);

  const fetchEmployeeDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('employee_id', employee.employee_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleAddDocument = () => {
    setEditingDocument(null);
    setFormData({
      doc_type: DOCUMENT_TYPES[0],
      doc_number: 1,
      sender: '',
      receiver: '',
      date_filled: '',
      date_sent: '',
      status: 'active',
    });
    setShowDocModal(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      doc_type: document.doc_type,
      doc_number: document.doc_number || 1,
      sender: document.sender || '',
      receiver: document.receiver || '',
      date_filled: document.date_filled || '',
      date_sent: document.date_sent || '',
      status: document.status || 'active',
    });
    setShowDocModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docTypeNumber = parseInt(formData.doc_type.split('.')[0]);
    const needsStatus = docTypeNumber >= 6 && docTypeNumber <= 10;

    const documentData = {
      doc_type: formData.doc_type,
      doc_number: needsStatus ? formData.doc_number : 1,
      sender: formData.sender,
      receiver: formData.receiver,
      date_filled: formData.date_filled || null,
      date_sent: formData.date_sent || null,
      status: needsStatus ? formData.status : null,
      updated_at: new Date().toISOString(),
    };

    if (editingDocument) {
      const { error } = await supabase
        .from('documents')
        .update(documentData)
        .eq('id', editingDocument.id);

      if (!error) {
        fetchEmployeeDocuments();
        closeDocModal();
      }
    } else {
      const { error } = await supabase.from('documents').insert([
        {
          employee_id: employee.employee_id,
          ...documentData,
        },
      ]);

      if (!error) {
        fetchEmployeeDocuments();
        closeDocModal();
      }
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (confirm('Do you want to delete this document??')) {
      const { error } = await supabase.from('documents').delete().eq('id', docId);

      if (!error) {
        fetchEmployeeDocuments();
      }
    }
  };

  const closeDocModal = () => {
    setShowDocModal(false);
    setEditingDocument(null);
  };

  const docTypeNumber = parseInt(formData.doc_type.split('.')[0]);
  const needsStatus = docTypeNumber >= 6 && docTypeNumber <= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Name: {employee.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              EmployeeId: {employee.employee_id} | Division: {employee.division} | Status:{' '}
              {employee.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              DocList ({documents.length})
            </h3>
            <button
              onClick={handleAddDocument}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Document
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No Document Information
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => {
                const docNum = parseInt(document.doc_type.split('.')[0]);
                const showStatus = docNum >= 6 && docNum <= 10;
                const isExpanded = expandedDoc === document.id;

                return (
                  <div
                    key={document.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <button
                      onClick={() =>
                        setExpandedDoc(isExpanded ? null : document.id!)
                      }
                      className="w-full p-4 hover:bg-gray-50 transition flex items-start justify-between"
                    >
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {document.doc_type}
                          {showStatus && document.doc_number && (
                            <span className="text-sm text-gray-600 ml-2">
                              (No. {document.doc_number})
                            </span>
                          )}
                        </p>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <p>
                            Sender: <span className="font-medium">{document.sender || '-'}</span>
                          </p>
                          <p>
                            Receiver: <span className="font-medium">{document.receiver || '-'}</span>
                          </p>
                          <div className="flex gap-4">
                            <p>
                              Date Filled In:{' '}
                              <span className="font-medium">
                                {document.date_filled
                                  ? new Date(document.date_filled).toLocaleDateString('th-TH')
                                  : '-'}
                              </span>
                            </p>
                            <p>
                              Date of Delivery:{' '}
                              <span className="font-medium">
                                {document.date_sent
                                  ? new Date(document.date_sent).toLocaleDateString('th-TH')
                                  : '-'}
                              </span>
                            </p>
                          </div>
                          {showStatus && document.status && (
                            <p>
                              Status:{' '}
                              <span
                                className={`font-medium ${
                                  document.status === 'active'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {document.status === 'active' ? 'Active' : 'Cancelled'}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        } ml-4 flex-shrink-0`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditDocument(document)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id!)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showDocModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDocument ? 'Edit Document' : 'Add New Document'}
                </h2>
                <button
                  onClick={closeDocModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DocType
                    </label>
                    <select
                      value={formData.doc_type}
                      onChange={(e) =>
                        setFormData({ ...formData, doc_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {needsStatus && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No.
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.doc_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              doc_number: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sender
                    </label>
                    <select
                      value={formData.sender}
                      onChange={(e) =>
                        setFormData({ ...formData, sender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Sender</option>
                      {SENDERS.map((sender) => (
                        <option key={sender} value={sender}>
                          {sender}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receiver
                    </label>
                    <select
                      value={formData.receiver}
                      onChange={(e) =>
                        setFormData({ ...formData, receiver: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Receiver</option>
                      {RECEIVERS.map((receiver) => (
                        <option key={receiver} value={receiver}>
                          {receiver}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Filled In
                    </label>
                    <input
                      type="date"
                      value={formData.date_filled}
                      onChange={(e) =>
                        setFormData({ ...formData, date_filled: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Delivery
                    </label>
                    <input
                      type="date"
                      value={formData.date_sent}
                      onChange={(e) =>
                        setFormData({ ...formData, date_sent: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeDocModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editingDocument ? 'Enter' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
