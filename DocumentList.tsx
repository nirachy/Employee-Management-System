import { useState, useEffect } from 'react';
import {
  supabase,
  Document,
  Employee,
  DOCUMENT_TYPES,
  SENDERS,
  RECEIVERS,
} from '../lib/supabase';
import { Search, Plus, Edit2, Trash2, X, FileText } from 'lucide-react';

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    doc_type: DOCUMENT_TYPES[0],
    doc_number: 1,
    sender: '',
    receiver: '',
    date_filled: '',
    date_sent: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchQuery, documents]);

  const fetchData = async () => {
    setLoading(true);

    const [docsResult, empsResult] = await Promise.all([
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('employees').select('*').order('employee_id', { ascending: true }),
    ]);

    if (!docsResult.error && docsResult.data) {
      setDocuments(docsResult.data);
    }

    if (!empsResult.error && empsResult.data) {
      setEmployees(empsResult.data);
    }

    setLoading(false);
  };

  const filterDocuments = () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter((doc) => {
      const employee = employees.find((e) => e.employee_id === doc.employee_id);
      return (
        doc.employee_id.toLowerCase().includes(query) ||
        employee?.name.toLowerCase().includes(query) ||
        doc.doc_type.toLowerCase().includes(query)
      );
    });
    setFilteredDocuments(filtered);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.employee_id === employeeId);
    return employee?.name || employeeId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const docTypeNumber = parseInt(formData.doc_type.split('.')[0]);
    const needsStatus = docTypeNumber >= 6 && docTypeNumber <= 10;

    const documentData = {
      employee_id: formData.employee_id,
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
        fetchData();
        closeModal();
      }
    } else {
      const { error } = await supabase.from('documents').insert([documentData]);

      if (!error) {
        fetchData();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Do you want to delete this document?')) {
      const { error } = await supabase.from('documents').delete().eq('id', id);

      if (!error) {
        fetchData();
      }
    }
  };

  const openAddModal = () => {
    setEditingDocument(null);
    setFormData({
      employee_id: employees[0]?.employee_id || '',
      doc_type: DOCUMENT_TYPES[0],
      doc_number: 1,
      sender: '',
      receiver: '',
      date_filled: '',
      date_sent: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      employee_id: document.employee_id,
      doc_type: document.doc_type,
      doc_number: document.doc_number || 1,
      sender: document.sender || '',
      receiver: document.receiver || '',
      date_filled: document.date_filled || '',
      date_sent: document.date_sent || '',
      status: document.status || 'active',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDocument(null);
  };

  const docTypeNumber = parseInt(formData.doc_type.split('.')[0]);
  const needsStatus = docTypeNumber >= 6 && docTypeNumber <= 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add File
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  EmployeeID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  DocType
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Receiver
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date Filled in
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date of Delivery
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => {
                const docNum = parseInt(document.doc_type.split('.')[0]);
                const showStatus = docNum >= 6 && docNum <= 10;

                return (
                  <tr key={document.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {document.employee_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {getEmployeeName(document.employee_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {document.doc_type}
                      {showStatus && document.doc_number && ` (No. ${document.doc_number})`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {document.sender || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {document.receiver || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {document.date_filled
                        ? new Date(document.date_filled).toLocaleDateString('th-TH')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {document.date_sent
                        ? new Date(document.date_sent).toLocaleDateString('th-TH')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {showStatus && document.status ? (
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            document.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {document.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(document)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.id!)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              Document Information Not Found
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDocument ? 'Edit Document' : 'Add New Document'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_id} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Canceled</option>
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
                    Date Filled in
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
                  onClick={closeModal}
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
  );
}
