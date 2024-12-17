import Layout from "@/components/Layout";
import Graph from "@/components/ui/Graph";

export default function Home() {
  const sampleData = [
    { label: "January", orders: 400, invoices: 240 },
    { label: "February", orders: 300, invoices: 139 },
    { label: "March", orders: 200, invoices: 980 },
  ];

  return (
    <Layout header={"Dashboard"}>
      <div className="w-full md:w-[40%] border border-border rounded-md">
        <Graph
          data={sampleData}
          graphType="bar"
          dataKeys={["orders", "invoices"]}
        />
      </div>
      <div className="w-full md:w-[40%] border border-border rounded-md">
        <Graph
          data={sampleData}
          graphType="line"
          dataKeys={["orders", "invoices"]}
        />
      </div>

      <div className="w-full md:w-[40%] border border-border rounded-md">
        <Graph
          data={[
            { label: "Jan", value: 400 },
            { label: "Feb", value: 300 },
            { label: "Mar", value: 500 },
          ]}
          graphType="pie"
          fillColors={["#ef4444", "#10b981", "#6366f1"]}
        />
      </div>

      <div className="w-full md:w-[40%] border border-border rounded-md">
        <Graph
          data={[
            { label: "Jan", value: 400 },
            { label: "Feb", value: 300 },
            { label: "Mar", value: 500 },
          ]}
          graphType="ring"
          fillColors={["#ef4444", "#10b981", "#6366f1"]}
        />
      </div>
    </Layout>
  );
}
