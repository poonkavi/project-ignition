import Layout from "@/components/layout/Layout";

const Dashboard = () => {
  return (
    <Layout patientName="Patient">
      <div className="container px-4 py-6">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Quick Actions</h2>
        <p className="text-muted-foreground">Dashboard with communication buttons - Coming in Phase 3</p>
      </div>
    </Layout>
  );
};

export default Dashboard;
