import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientsAPI } from '../lib/api';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  ArrowLeft, 
  Users, 
  UserCog, 
  Shield,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminPage() {
  const navigate = useNavigate();
  const { nurse } = useAuth();
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nurse?.is_admin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [nurse, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all nurses
      const nursesRes = await axios.get(`${API}/admin/nurses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNurses(nursesRes.data);

      // Fetch all patients
      const patientsRes = await patientsAPI.list();
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (nurseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/nurses/${nurseId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nurse promoted to admin');
      fetchData();
    } catch (error) {
      toast.error('Failed to promote nurse');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">Admin Panel</h1>
                  <p className="text-sm text-slate-500">Manage nurses and assignments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Nurses</p>
                  <p className="text-3xl font-bold text-slate-900">{nurses.length}</p>
                </div>
                <Users className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Patients</p>
                  <p className="text-3xl font-bold text-slate-900">{patients.length}</p>
                </div>
                <Users className="w-10 h-10 text-eggplant-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Admins</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {nurses.filter(n => n.is_admin).length}
                  </p>
                </div>
                <Shield className="w-10 h-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/reports')}
                className="h-16 bg-eggplant-700 hover:bg-eggplant-600 justify-between"
              >
                <span className="text-lg">Monthly Reports</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="h-16 justify-between"
              >
                <span className="text-lg">Manage Patients</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nurses Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Manage Nurses
            </CardTitle>
            <CardDescription>
              View all nurses and manage admin privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nurses.map(nurseItem => (
                <div 
                  key={nurseItem.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        {nurseItem.full_name}
                        {nurseItem.is_admin && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {nurseItem.email} • {nurseItem.title} • {nurseItem.license_number || 'No license'}
                      </p>
                    </div>
                  </div>
                  {!nurseItem.is_admin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePromoteToAdmin(nurseItem.id)}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Promote to Admin
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
