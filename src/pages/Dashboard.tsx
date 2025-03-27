import Sidebar from "../components/Sidebar";
import { Card } from "../components/Card";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Classrooms" description="Manage and view your classes." />
          <Card title="Calendar" description="View upcoming events and deadlines." />
          <Card title="Recent Activity" description="See what's new in your courses." />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
