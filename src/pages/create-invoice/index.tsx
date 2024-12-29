import Layout from "@/components/Layout";

export default function Index() {
  return (
    <Layout header={(
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="font-extrabold text-2xl uppercase">Create Invoice</h1>
        </div>
      </div>
    )}>
      <div>
        <h1>Create Invoice</h1>
      </div>
    </Layout>
  )
}