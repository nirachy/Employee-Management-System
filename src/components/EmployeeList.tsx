// src/components/EmployeeList.tsx
// ----------------------------------------
// หน้า list พนักงาน + ปุ่มเปิด EmployeeDocumentsModal
// ----------------------------------------

import React, { useState } from "react";
import { Employee } from "../supabase";
import EmployeeDocumentsModal from "./EmployeeDocumentsModal";

// mock employees สำหรับ demo
const MOCK_EMPLOYEES: Employee[] = [
  {
    employee_id: "EMP001",
    name: "สมชาย ใจดี",
    division: "HR",
    status: "Active",
  },
  {
    employee_id: "EMP002",
    name: "สมหญิง อดทน",
    division: "Accounting",
    status: "Active",
  },
  {
    employee_id: "EMP003",
    name: "John Doe",
    division: "IT",
    status: "Inactive",
  },
];

const EmployeeList: React.FC = () => {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Employee Document System
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          ระบบจัดการเอกสารพนักงาน (เดโม) — สามารถเชื่อมต่อ Supabase จริงทีหลังได้
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2 border-b">Employee ID</th>
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b">Division</th>
                <th className="px-3 py-2 border-b">Status</th>
                <th className="px-3 py-2 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.employee_id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-3 py-2 border-b">{emp.employee_id}</td>
                  <td className="px-3 py-2 border-b">{emp.name}</td>
                  <td className="px-3 py-2 border-b">{emp.division}</td>
                  <td className="px-3 py-2 border-b">
                    <span
                      className={
                        emp.status === "Active"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b text-right">
                    <button
                      className="px-3 py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      View Documents
                    </button>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-gray-500"
                    colSpan={5}
                  >
                    No employees
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ดูเอกสารพนักงานแต่ละคน */}
      {selectedEmployee && (
        <EmployeeDocumentsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default EmployeeList;
