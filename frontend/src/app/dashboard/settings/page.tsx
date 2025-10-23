'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, MoreVertical, Save } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import axios from 'axios';
import Image from 'next/image';

interface Profile {
  company_name: string;
  location: string;
  tier_level: string;
  industry: string;
  contact_email: string;
  phone: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  certificate_expiry: boolean;
  regulatory_updates: boolean;
  risk_alerts: boolean;
}

interface TeamMember {
  user_id: string;
  name: string;
  email: string;
  role: string;
  invited_at: string;
}

export default function SettingsPage() {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'team'>('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    company_name: '',
    location: '',
    tier_level: 'Tier 2',
    industry: '',
    contact_email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    certificate_expiry: true,
    regulatory_updates: true,
    risk_alerts: true,
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [languagePreference, setLanguagePreference] = useState('en');

  useEffect(() => {
    fetchProfile();
    fetchNotificationSettings();
    fetchTeamMembers();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.profile);
      setLanguagePreference(response.data.profile.language_preference || 'en');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/team`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeamMembers(response.data.team_members);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/profile`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/notifications`,
        notificationSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Notification settings updated!');
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const inviteTeamMember = async () => {
    const email = prompt('Enter team member email:');
    const role = prompt('Enter role (admin/member/viewer):');
    
    if (!email || !role) return;
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/team/invite`,
        { email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamMembers();
      alert('Team member invited!');
    } catch (error) {
      console.error('Failed to invite team member:', error);
      alert('Failed to invite team member');
    }
  };

  const removeTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/team/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTeamMembers();
    } catch (error) {
      console.error('Failed to remove team member:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Image 
            src="/scap-icon.png" 
            alt="SCAP" 
            width={48} 
            height={48}
            className="opacity-80"
          />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-4 transition ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-2 px-4 transition ${
              activeTab === 'account'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2 px-4 transition ${
              activeTab === 'notifications'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-2 px-4 transition ${
              activeTab === 'team'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Team
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Company Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Company Name</label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Priya Textiles Pvt Ltd"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tirupur, Tamil Nadu"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground text-sm mb-2">Tier Level</label>
                  <select
                    value={profile.tier_level}
                    onChange={(e) => setProfile({ ...profile, tier_level: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Tier 2</option>
                    <option>Tier 3</option>
                    <option>Tier 4</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-2">Industry</label>
                <select
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Textile - Dyeing</option>
                  <option>Textile - Weaving</option>
                  <option>Textile - Garment Manufacturing</option>
                  <option>Textile - Spinning</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Language Preference</h2>
              <select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
                className="bg-background border border-input rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Change Password</h2>
              <form onSubmit={changePassword} className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground font-medium">Email Notifications</p>
                  <p className="text-muted-foreground text-sm">Receive updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={() => toggleNotification('email')}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground font-medium">SMS Alerts</p>
                  <p className="text-muted-foreground text-sm">Critical alerts via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.sms}
                  onChange={() => toggleNotification('sms')}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground font-medium">Certificate Expiry Reminders</p>
                  <p className="text-muted-foreground text-sm">Get reminded 30 days before expiry</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.certificate_expiry}
                  onChange={() => toggleNotification('certificate_expiry')}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-foreground font-medium">Regulatory Updates</p>
                  <p className="text-muted-foreground text-sm">New compliance regulations</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.regulatory_updates}
                  onChange={() => toggleNotification('regulatory_updates')}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-foreground font-medium">Risk Alerts</p>
                  <p className="text-muted-foreground text-sm">Risk score changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.risk_alerts}
                  onChange={() => toggleNotification('risk_alerts')}
                  className="w-5 h-5"
                />
              </div>
            </div>
            <button
              onClick={saveNotificationSettings}
              disabled={loading}
              className="mt-6 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
              <button
                onClick={inviteTeamMember}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Invite Member
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between bg-muted rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{member.name}</p>
                      <p className="text-muted-foreground text-sm">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-secondary rounded text-sm text-secondary-foreground">
                      {member.role}
                    </span>
                    <button
                      onClick={() => removeTeamMember(member.user_id)}
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
