import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Map URL segments to actual Prisma model names
const modelMap: Record<string, string> = {
  user: "user",
  course: "course",
  enrollment: "enrollment",
  homework: "homework",
  message: "message",
};

export default async function GenericModelViewer({ params }: { params: { model: string } }) {
  const modelName = modelMap[params.model];
  
  if (!modelName || !(prisma as any)[modelName]) {
    notFound();
  }

  // Fetch data
  const data = await (prisma as any)[modelName].findMany({
    take: 100, // Limit to 100 rows for simplicity
  });

  // Extract columns dynamically from the first record, or fallback if empty
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Server action to delete a record
  async function deleteRecord(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      try {
        await (prisma as any)[modelName].delete({
          where: { id },
        });
        revalidatePath(`/dashboard/admin/${params.model}`);
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  }

  return (
    <div className="p-8 bg-st-light min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-st-dark capitalize">{params.model}s</h1>
        <span className="bg-st-purple text-white text-sm px-3 py-1 rounded-full shadow-sm">
          Total: {data.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No records found for this model.
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {columns.map((col) => (
                    <th 
                      key={col} 
                      className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row: any, i: number) => (
                  <tr key={row.id || i} className="hover:bg-gray-50/50">
                    {columns.map((col) => (
                      <td key={col} className="py-4 px-6 text-sm text-st-dark max-w-[200px] truncate">
                        {String(row[col])}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-sm font-medium text-right">
                      <form action={deleteRecord}>
                        <input type="hidden" name="id" value={row.id} />
                        <button 
                          type="submit" 
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={(e) => {
                            if (!confirm("Are you sure you want to delete this record?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
