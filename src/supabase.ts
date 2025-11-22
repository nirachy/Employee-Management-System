// src/supabase.ts
// -----------------------------
// เก็บ type พนักงาน / เอกสาร + DOCUMENT_TYPES + supabase (mock)
// ถ้าจะใช้ Supabase จริง ให้เปลี่ยนส่วน supabase ด้านล่างเอาเอง
// -----------------------------

export interface Document {
  id?: string;
  employee_id: string;
  doc_type: string;
  doc_number: number;
  sender: string;
  receiver: string;
  date_filled: string;
  date_sent: string;
  status: string;
  created_at?: string;
}

export interface Employee {
  employee_id: string;
  name: string;
  division: string;
  status: string;
}

export const DOCUMENT_TYPES = [
  "1.ใบสมัครงาน",
  "2.สำเนาบัตรประชาชน",
  "3.สำเนาทะเบียนบ้าน",
  "4.วุฒิการศึกษา",
];

// mock supabase สำหรับให้โค้ดรันได้ใน local/dev
// ถ้าเจ๊มี supabase จริง ให้ import ของจริงมาแทนอันนี้
export const supabase = {
  from(table: string) {
    return {
      select(_cols: string = "*") {
        return {
          eq(_field: string, _value: any) {
            // คืน array ว่าง ๆ ไปก่อน (ไม่มีข้อมูล)
            return Promise.resolve({ data: [] as Document[], error: null });
          },
        };
      },
      insert(_payload: any) {
        return Promise.resolve({ data: null, error: null });
      },
      update(_payload: any) {
        return {
          eq(_field: string, _value: any) {
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
      delete() {
        return {
          eq(_field: string, _value: any) {
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
    };
  },
};
