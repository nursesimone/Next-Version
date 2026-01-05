import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientsAPI } from '../lib/api';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { 
  ArrowLeft, 
  Users, 
  UserCog, 
  Shield,
  ChevronRight,
  Plus,
  Eye,
  Edit
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
  const [showAddNurseDialog, setShowAddNurseDialog] = useState(false);
  const [showNurseProfileDialog, setShowNurseProfileDialog] = useState(false);
  const [showEditNurseDialog, setShowEditNurseDialog] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [editNurseData, setEditNurseData] = useState({
    full_name: '',
    title: '',
    license_number: '',
    email: ''
  });
  const [assignmentData, setAssignmentData] = useState({
    assigned_patients: [],
    assigned_organizations: []
  });
  const [newNurseData, setNewNurseData] = useState({
    email: '',
    password: '',
    full_name: '',
    title: 'RN',
    license_number: ''
  });

  useEffect(() => {
    if (!nurse?.is_admin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [nurse, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('nurse_token');
      
      // Fetch all nurses
      const nursesRes = await axios.get(`${API}/admin/nurses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNurses(nursesRes.data);

      // Fetch all patients
      const patientsRes = await patientsAPI.list();
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Admin data fetch error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (nurseId) => {
    try {
      const token = localStorage.getItem('nurse_token');
      await axios.post(`${API}/admin/nurses/${nurseId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nurse promoted to admin');
      fetchData();
    } catch (error) {
      toast.error('Failed to promote nurse');
    }
  };

  const handleDemoteFromAdmin = async (nurseId) => {
    try {
      const token = localStorage.getItem('nurse_token');
      await axios.post(`${API}/admin/nurses/${nurseId}/demote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin privileges removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to demote nurse');
    }
  };

  const handleAddNurse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('nurse_token');
      await axios.post(`${API}/auth/register`, newNurseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Nurse added successfully');
      setShowAddNurseDialog(false);
      setNewNurseData({
        email: '',
        password: '',
        full_name: '',
        title: 'RN',
        license_number: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add nurse');
    }
  };

  const handleViewNurseProfile = (nurseItem) => {
    setSelectedNurse(nurseItem);
    setShowNurseProfileDialog(true);
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  Manage Nurses
                </CardTitle>
                <CardDescription>
                  View all nurses and manage admin privileges
                </CardDescription>
              </div>
              <Dialog open={showAddNurseDialog} onOpenChange={setShowAddNurseDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Nurse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Nurse</DialogTitle>
                    <DialogDescription>
                      Create a new nurse account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddNurse} className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={newNurseData.full_name}
                        onChange={(e) => setNewNurseData({...newNurseData, full_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newNurseData.email}
                        onChange={(e) => setNewNurseData({...newNurseData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={newNurseData.password}
                        onChange={(e) => setNewNurseData({...newNurseData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newNurseData.title}
                        onChange={(e) => setNewNurseData({...newNurseData, title: e.target.value})}
                        placeholder="e.g., RN, LPN"
                        required
                      />
                    </div>
                    <div>
                      <Label>License Number</Label>
                      <Input
                        value={newNurseData.license_number}
                        onChange={(e) => setNewNurseData({...newNurseData, license_number: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddNurseDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-500">
                        Add Nurse
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nurses.map(nurseItem => (
                <div 
                  key={nurseItem.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewNurseProfile(nurseItem)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    {nurseItem.is_admin && nurseItem.id !== nurse?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDemoteFromAdmin(nurseItem.id)}
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      >
                        Remove Admin
                      </Button>
                    )}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Nurse Profile Dialog */}
      <Dialog open={showNurseProfileDialog} onOpenChange={setShowNurseProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nurse Profile</DialogTitle>
          </DialogHeader>
          {selectedNurse && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {selectedNurse.full_name}
                    {selectedNurse.is_admin && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                        Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500">{selectedNurse.title}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-500">Email</Label>
                  <p className="font-medium">{selectedNurse.email}</p>
                </div>
                
                <div>
                  <Label className="text-slate-500">License Number</Label>
                  <p className="font-medium">{selectedNurse.license_number || 'Not provided'}</p>
                </div>
                
                <div>
                  <Label className="text-slate-500">Account Created</Label>
                  <p className="font-medium">
                    {new Date(selectedNurse.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-slate-500">User ID</Label>
                  <p className="font-mono text-xs text-slate-600">{selectedNurse.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
